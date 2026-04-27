import pino from 'pino';
import { env, isDevelopment } from '@config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'soynativo-backend', env: env.NODE_ENV },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l', ignore: 'pid,hostname' },
    },
  }),
});

export type Logger = typeof logger;
