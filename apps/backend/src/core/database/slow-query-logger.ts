import { Logger as TypeORMLogger, type QueryRunner } from 'typeorm';
import { logger } from '@core/logger/logger';

/**
 * Custom TypeORM logger that flags slow queries. Anything ≥ thresholdMs is
 * logged at WARN with the SQL + params; above 500ms also includes the
 * caller stack to help find the offending repository.
 *
 * In production we want this on stage but off in prod (use APM instead).
 */
export class SlowQueryLogger implements TypeORMLogger {
  constructor(private readonly thresholdMs = 50) {}

  logQuery(query: string, params?: unknown[]): void {
    // No-op for fast path; we only care about slow.
  }

  logQueryError(error: string | Error, query: string, params?: unknown[]): void {
    logger.error({ err: error, query, params }, 'sql query error');
  }

  logQuerySlow(time: number, query: string, params?: unknown[]): void {
    if (time < this.thresholdMs) return;
    logger.warn(
      { durationMs: time, query, params, ...(time >= 500 ? { stack: new Error().stack } : {}) },
      'slow sql query'
    );
  }

  logSchemaBuild(message: string): void {
    logger.debug({ message }, 'schema build');
  }

  logMigration(message: string): void {
    logger.info({ message }, 'migration');
  }

  log(level: 'log' | 'info' | 'warn', message: unknown, _qr?: QueryRunner): void {
    const map = { log: 'debug', info: 'info', warn: 'warn' } as const;
    logger[map[level]]({ message }, 'typeorm');
  }
}
