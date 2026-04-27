import * as SecureStore from 'expo-secure-store';

const ACCESS = 'soynativo.accessToken';
const REFRESH = 'soynativo.refreshToken';

/**
 * Tokens live in the iOS Keychain / Android Keystore via expo-secure-store —
 * not in AsyncStorage / MMKV — because they are sensitive credentials.
 */
export const tokenStorage = {
  async setPair(access: string, refresh: string): Promise<void> {
    await Promise.all([SecureStore.setItemAsync(ACCESS, access), SecureStore.setItemAsync(REFRESH, refresh)]);
  },
  getAccess: () => SecureStore.getItemAsync(ACCESS),
  getRefresh: () => SecureStore.getItemAsync(REFRESH),
  async clear(): Promise<void> {
    await Promise.all([SecureStore.deleteItemAsync(ACCESS), SecureStore.deleteItemAsync(REFRESH)]);
  },
};
