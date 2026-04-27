import type { Config } from 'jest';

/**
 * Two projects keep unit tests fast (no I/O) and integration tests isolated
 * (real Postgres + Redis via docker-compose). CI runs both; locally you can
 * run `yarn test -- --selectProjects unit` for the tight feedback loop.
 */
const config: Config = {
  rootDir: '.',
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      testPathIgnorePatterns: ['\\.integration\\.test\\.ts$'],
      setupFiles: ['<rootDir>/test/setup-unit.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
        '^@soynativo/shared$': '<rootDir>/../../packages/shared/src',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      transform: {
        '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.json' }],
      },
      extensionsToTreatAsEsm: ['.ts'],
    },
    {
      displayName: 'integration',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/**/*.integration.test.ts', '<rootDir>/test/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/setup-integration.ts'],
      testTimeout: 30_000,
      maxWorkers: 1,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
        '^@soynativo/shared$': '<rootDir>/../../packages/shared/src',
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      transform: {
        '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.json' }],
      },
      extensionsToTreatAsEsm: ['.ts'],
    },
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.dto.ts',
    '!src/server.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: { branches: 60, functions: 70, lines: 70, statements: 70 },
  },
};

export default config;
