import { MMKV } from 'react-native-mmkv';

/**
 * Synchronous, native-backed key-value store for the persisted React Query
 * cache. MMKV is ~30x faster than AsyncStorage and synchronous, which means
 * cold-start hydration of the query cache happens before first paint instead
 * of after.
 *
 * NOT for tokens — those go to expo-secure-store (Keychain/Keystore). Only
 * for non-sensitive cache data that survives restarts.
 */
const mmkv = new MMKV({ id: 'soynativo.query-cache' });

export const queryCacheStorage = {
  getItem: (key: string): string | null => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string): void => mmkv.set(key, value),
  removeItem: (key: string): void => mmkv.delete(key),
};
