import { Redis } from 'ioredis';
import { env } from '@config/env';
import { logger } from '@core/logger/logger';

export function createRedis(role: string): Redis {
  // BullMQ requires `maxRetriesPerRequest: null` on its connections.
  const isQueueConnection = role.startsWith('queue:');
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: isQueueConnection ? null : 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });
  client.on('error', (err) => logger.error({ err, role }, 'Redis error'));
  client.on('connect', () => logger.info({ role }, 'Redis connected'));
  return client;
}
