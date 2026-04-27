import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env, isProduction } from '@config/env';
import { SlowQueryLogger } from './slow-query-logger';

// In development we run TypeScript directly via `tsx`, so glob paths must point
// at .ts files. After `tsc` build, the same files are emitted as .js inside
// `dist/`. We pick the right path at runtime instead of duplicating configs.
const isCompiled = __filename.endsWith('.js');
const ext = isCompiled ? 'js' : 'ts';
const root = isCompiled ? 'dist' : 'src';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  // Migrations only — never `synchronize` to avoid silent schema drift.
  synchronize: false,
  entities: [`${root}/modules/**/*.entity.${ext}`],
  migrations: [`${root}/core/database/migrations/*.${ext}`],
  subscribers: [`${root}/modules/**/*.subscriber.${ext}`],
  poolSize: env.DATABASE_POOL_SIZE,
  // Statement timeout = hard kill at PG level for runaway queries.
  // applicationName helps identify our connections in pg_stat_activity.
  extra: {
    statement_timeout: 5_000,
    idle_in_transaction_session_timeout: 10_000,
    application_name: 'soynativo-backend',
    // Cache prepared statements to avoid re-parsing on every invocation.
    max: env.DATABASE_POOL_SIZE,
    keepAlive: true,
  },
  // Flag any single query taking ≥ 50ms.
  maxQueryExecutionTime: 50,
  logger: new SlowQueryLogger(50),
  logging: env.DATABASE_LOGGING ? 'all' : ['error', 'warn', 'migration'],
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
