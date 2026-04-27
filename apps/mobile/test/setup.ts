import '@testing-library/react-native';

// expo-secure-store relies on native modules that aren't available under Jest.
// Replace with an in-memory implementation so tests can read/write tokens.
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    deleteItemAsync: jest.fn(async (k: string) => void store.delete(k)),
    __reset: () => store.clear(),
  };
});

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

// Silence the Reanimated logger in tests
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Default to a stable timezone/locale
process.env.TZ = 'UTC';
