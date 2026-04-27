import 'reflect-metadata';
import express, { type Express, type Request, type Response } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import type { Redis } from 'ioredis';

import { env } from '@config/env';
import { logger } from '@core/logger/logger';
import { AppDataSource } from '@core/database/data-source';
import { errorHandler, notFoundHandler } from '@core/http/error-handler';
import { snapshotMetrics } from '@core/observability/metrics';
import { requestId } from '@shared/middleware/request-id.middleware';
import { serverTiming } from '@shared/middleware/server-timing.middleware';
import { metricsMiddleware } from '@shared/middleware/metrics.middleware';
import { requestTimeout } from '@shared/middleware/timeout.middleware';
import { buildAuthRouter } from '@modules/auth/auth.routes';
import { buildUserRouter } from '@modules/users/user.routes';
import { openApiSpec } from '@core/http/openapi';
import { container } from 'tsyringe';
import { Tokens } from '@core/di/tokens';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  // gzip/brotli only kicks in for sufficiently large bodies; Brotli is
  // negotiated when the client supports it.
  app.set('etag', 'strong');

  // Cross-cutting middleware. Order matters:
  // 1. requestId — earliest, so logs/timings carry it.
  // 2. timing — must wrap everything we want to measure.
  // 3. timeout — kills hung handlers regardless of where they hang.
  // 4. logger — has access to id and timing.
  app.use(requestId);
  app.use(serverTiming);
  app.use(metricsMiddleware);
  app.use(requestTimeout(5_000));
  app.use(pinoHttp({ logger, customProps: (req) => ({ requestId: (req as Request).id }) }));

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true, maxAge: 600 }));
  app.use(compression({ threshold: 1024 }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/health', async (_req, res) => res.json({ status: 'ok' }));

  // Liveness — simple proof the process is alive.
  app.get('/live', (_req, res) => res.json({ status: 'alive' }));

  // Readiness — proves we can serve traffic. Used by k8s/load balancer to
  // route only when DB + Redis are reachable.
  app.get('/ready', async (_req, res) => {
    const checks = await Promise.allSettled([
      AppDataSource.query('SELECT 1'),
      (container.resolve<Redis>(Tokens.Redis) as Redis).ping(),
    ]);
    const ok = checks.every((c) => c.status === 'fulfilled');
    res.status(ok ? 200 : 503).json({
      status: ok ? 'ready' : 'degraded',
      checks: { db: checks[0].status, redis: checks[1].status },
    });
  });

  // In-process latency snapshot. Plug Prometheus / OTel later.
  app.get('/metrics', (_req: Request, res: Response) => res.json(snapshotMetrics()));

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  const apiBase = `${env.API_PREFIX}/${env.API_VERSION}`;
  app.use(`${apiBase}/auth`, buildAuthRouter());
  app.use(`${apiBase}/users`, buildUserRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
