import 'reflect-metadata';

// Unit tests must not rely on real env vars or external services. We set
// deterministic defaults here so config/env doesn't blow up at import time.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'unit-test-access-secret-must-be-32-chars-long';
process.env.JWT_REFRESH_SECRET = 'unit-test-refresh-secret-must-be-32-chars-long';
process.env.LOG_LEVEL = 'silent';
