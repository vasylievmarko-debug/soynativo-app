import Constants from 'expo-constants';

interface AppEnv {
  apiUrl: string;
  wsUrl: string;
  sentryDsn?: string;
}

function read(key: string, fallback?: string): string {
  // EXPO_PUBLIC_* values are inlined at build time and accessible via process.env.
  const value = process.env[`EXPO_PUBLIC_${key}`] ?? Constants.expoConfig?.extra?.[key];
  if (!value && fallback === undefined) {
    throw new Error(`Missing env var EXPO_PUBLIC_${key}`);
  }
  return (value ?? fallback) as string;
}

export const appEnv: AppEnv = {
  apiUrl: read('API_URL', 'http://localhost:3000/api/v1'),
  wsUrl: read('WS_URL', 'ws://localhost:3000'),
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
};
