import 'reflect-metadata';
import { Worker } from 'bullmq';
import { createRedis } from '@core/cache/redis';
import { logger } from '@core/logger/logger';
import { QueueNames, type NotificationJob } from '../queues';

/**
 * Standalone worker process that drains the `notifications` queue and dispatches
 * messages to the appropriate channel (Telegram / push / email).
 *
 * Run independently of the API process so heavy I/O does not affect request
 * latency, and so we can scale workers horizontally (k8s replicas) when
 * notification volume grows.
 */
const connection = createRedis('queue:notifications:worker');

const worker = new Worker<NotificationJob>(
  QueueNames.Notifications,
  async (job) => {
    logger.info({ jobId: job.id, channel: job.data.channel }, 'processing notification');
    // TODO: dispatch via TelegramService / PushService / EmailService.
    // Example branch:
    // if (job.data.channel === 'telegram') await telegram.send(...)
  },
  { connection, concurrency: 10 }
);

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'notification job failed');
});

worker.on('completed', (job) => {
  logger.debug({ jobId: job.id }, 'notification job completed');
});

const shutdown = async (): Promise<void> => {
  logger.info('notifications worker shutting down');
  await worker.close();
  await connection.quit();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
