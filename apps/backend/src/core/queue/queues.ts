import { Queue } from 'bullmq';
import type { Redis } from 'ioredis';

export const QueueNames = {
  Notifications: 'notifications',
  Reminders: 'reminders',
  Recordings: 'recordings',
} as const;

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];

export interface NotificationJob {
  channel: 'telegram' | 'push' | 'email';
  userId: string;
  template: string;
  data: Record<string, unknown>;
}

export interface ReminderJob {
  lessonId: string;
  type: 'starting_soon' | 'rescheduled' | 'cancelled';
}

export function createQueues(connection: Redis): {
  notifications: Queue<NotificationJob>;
  reminders: Queue<ReminderJob>;
  recordings: Queue;
} {
  const defaultJobOptions = {
    attempts: 5,
    backoff: { type: 'exponential' as const, delay: 1_000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400 },
  };

  return {
    notifications: new Queue<NotificationJob>(QueueNames.Notifications, {
      connection,
      defaultJobOptions,
    }),
    reminders: new Queue<ReminderJob>(QueueNames.Reminders, { connection, defaultJobOptions }),
    recordings: new Queue(QueueNames.Recordings, { connection, defaultJobOptions }),
  };
}
