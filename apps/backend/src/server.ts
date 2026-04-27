import 'reflect-metadata';
import { createServer } from 'node:http';
import { container } from 'tsyringe';
import { Server as SocketIOServer } from 'socket.io';

import { env } from '@config/env';
import { logger } from '@core/logger/logger';
import { AppDataSource } from '@core/database/data-source';
import { createRedis } from '@core/cache/redis';
import { createQueues } from '@core/queue/queues';
import { Tokens } from '@core/di/tokens';
import { registerCoreServices } from '@core/di/container';
import { createApp } from './app';

/**
 * Bootstrap order matters: open infrastructure connections first, register
 * them in the DI container, then start accepting traffic. On shutdown we
 * reverse the order so in-flight requests can finish before connections
 * are torn down.
 */
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
  const io = new SocketIOServer(httpServer, { cors: { origin: env.CORS_ORIGINS } });

  io.on('connection', (socket) => {
    logger.debug({ socketId: socket.id }, 'socket connected');
  });

  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, '🚀 server listening');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down');
    httpServer.close();
    await Promise.allSettled([
      queues.notifications.close(),
      queues.reminders.close(),
      queues.recordings.close(),
      queueConnection.quit(),
      redis.quit(),
      AppDataSource.destroy(),
    ]);
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

bootstrap().catch((err) => {
  logger.fatal({ err }, 'bootstrap failed');
  process.exit(1);
});
