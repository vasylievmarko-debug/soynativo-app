import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env, isProduction } from '@config/env';

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
  logging: env.DATABASE_LOGGING ? ['error', 'warn', 'migration', 'schema'] : ['error'],
  entities: [`${root}/modules/**/*.entity.${ext}`],
  migrations: [`${root}/core/database/migrations/*.${ext}`],
  subscribers: [`${root}/modules/**/*.subscriber.${ext}`],
  poolSize: env.DATABASE_POOL_SIZE,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
