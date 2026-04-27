import 'reflect-metadata';
import { AppDataSource } from '@core/database/data-source';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_ACCESS_SECRET ??= 'integration-test-access-secret-32chars-min';
process.env.JWT_REFRESH_SECRET ??= 'integration-test-refresh-secret-32chars-min';
process.env.DATABASE_URL ??= 'postgres://soynativo:soynativo@localhost:5432/soynativo_test';
process.env.REDIS_URL ??= 'redis://localhost:6379/1';

/**
 * Integration tests run against a real Postgres + Redis (start them with
 * `docker compose up -d postgres redis`). Schema is created once; each test
 * truncates tables to start clean.
 */
beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    await AppDataSource.synchronize(true); // safe: dedicated test DB
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

afterEach(async () => {
  if (!AppDataSource.isInitialized) return;
  const tables = AppDataSource.entityMetadatas.map((m) => `"${m.tableName}"`).join(', ');
  if (tables) await AppDataSource.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
});
