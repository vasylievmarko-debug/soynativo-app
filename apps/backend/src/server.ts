import 'reflect-metadata';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { createServer } from 'node:http';
import { container } from 'tsyringe';
import { Server as SocketIOServer } from 'socket.io';

import { env, isProduction } from '@config/env';
import { logger } from '@core/logger/logger';
import { AppDataSource } from '@core/database/data-source';
import { createRedis } from '@core/cache/redis';
import { createQueues } from '@core/queue/queues';
import { Tokens } from '@core/di/tokens';
import { registerCoreServices } from '@core/di/container';
import { createApp } from './app';

const KEEP_ALIVE_TIMEOUT = 65_000; // > most LB idle timeouts (60s) → reuses TCP
const HEADERS_TIMEOUT = 66_000; // must be > keepAliveTimeout
const SHUTDOWN_TIMEOUT = 15_000;

/**
 * In production, fork one worker per CPU minus 1 (leaving headroom for OS,
 * background tasks, and the master). In dev/test we run a single process so
 * debugging is straightforward.
 */
async function main(): Promise<void> {
  if (isProduction && cluster.isPrimary) {
    const workers = Math.max(1, availableParallelism() - 1);
    logger.info({ workers }, 'cluster primary forking workers');
    for (let i = 0; i < workers; i++) cluster.fork();

    cluster.on('exit', (worker, code, signal) => {
      logger.warn({ pid: worker.process.pid, code, signal }, 'worker died, restarting');
      cluster.fork();
    });
    return;
  }

  await bootstrap();
}

async function bootstrap(): Promise<void> {
  registerCoreServices();

  await AppDataSource.initialize();
  logger.info('database connected');
  container.registerInstance(Tokens.DataSource, AppDataSource);

  const redis = createRedis('app');
  container.registerInstance(Tokens.Redis, redis);

  const queueConnection = createRedis('queue:producer');
  const queues = createQueues(queueConnection);
  container.registerInstance(Tokens.NotificationsQueue, queues.notifications);
  container.registerInstance(Tokens.RemindersQueue, queues.reminders);

  const app = createApp();
  const httpServer = createServer(app);
  // Tune connection reuse: behind a load balancer with 60s idle timeout, we
  // want our keep-alive to survive that, so the LB reuses TCP connections.
  httpServer.keepAliveTimeout = KEEP_ALIVE_TIMEOUT;
  httpServer.headersTimeout = HEADERS_TIMEOUT;

  const io = new SocketIOServer(httpServer, { cors: { origin: env.CORS_ORIGINS } });
  io.on('connection', (socket) => logger.debug({ socketId: socket.id }, 'socket connected'));

  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV, pid: process.pid }, '🚀 server listening');
  });

  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'graceful shutdown started');

    // Stop accepting new connections; existing requests get SHUTDOWN_TIMEOUT
    // to drain before we force-close.
    httpServer.close();
    const force = setTimeout(() => {
      logger.warn('forcing shutdown after timeout');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    await Promise.allSettled([
      queues.notifications.close(),
      queues.reminders.close(),
      queues.recordings.close(),
      queueConnection.quit(),
      redis.quit(),
      AppDataSource.destroy(),
    ]);

    clearTimeout(force);
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => logger.error({ reason }, 'unhandledRejection'));
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaughtException');
    process.exit(1);
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'bootstrap failed');
  process.exit(1);
});
