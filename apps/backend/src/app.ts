import 'reflect-metadata';
import express, { type Express } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from '@config/env';
import { logger } from '@core/logger/logger';
import { errorHandler, notFoundHandler } from '@core/http/error-handler';
import { requestId } from '@shared/middleware/request-id.middleware';
import { buildAuthRouter } from '@modules/auth/auth.routes';
import { buildUserRouter } from '@modules/users/user.routes';
import { openApiSpec } from '@core/http/openapi';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Cross-cutting middleware
  app.use(requestId);
  app.use(pinoHttp({ logger, customProps: (req) => ({ requestId: req.id }) }));
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  app.use(compression());
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

  // Health & readiness — kept off the versioned API path so orchestrators
  // never have to track API versions.
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/ready', (_req, res) => res.json({ status: 'ready' }));

  // OpenAPI docs
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // Versioned API
  const apiBase = `${env.API_PREFIX}/${env.API_VERSION}`;
  app.use(`${apiBase}/auth`, buildAuthRouter());
  app.use(`${apiBase}/users`, buildUserRouter());
  // app.use(`${apiBase}/lessons`, buildLessonRouter());
  // app.use(`${apiBase}/bookings`, buildBookingRouter());
  // app.use(`${apiBase}/notifications`, buildNotificationRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
