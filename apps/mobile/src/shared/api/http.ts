import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { appEnv } from '@shared/config/env';
import { tokenStorage } from './token-storage';

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Single axios instance used across the app. Two responsibilities:
 *
 * 1. Attach the bearer token automatically on every request.
 * 2. On 401, attempt one refresh-token round-trip and replay the original
 *    request. Concurrent 401s share the same in-flight refresh promise so we
 *    only hit /auth/refresh once.
 */
export const http: AxiosInstance = axios.create({
  baseURL: appEnv.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    refreshPromise ??= refreshAccessToken();
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (!newToken) {
      await tokenStorage.clear();
      return Promise.reject(error);
    }
    original.headers.Authorization = `Bearer ${newToken}`;
    return http(original);
  }
);

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await tokenStorage.getRefresh();
  if (!refresh) return null;
  try {
    const { data } = await axios.post<{ tokens: { accessToken: string; refreshToken: string } }>(
      `${appEnv.apiUrl}/auth/refresh`,
      { refreshToken: refresh }
    );
    await tokenStorage.setPair(data.tokens.accessToken, data.tokens.refreshToken);
    return data.tokens.accessToken;
  } catch {
    return null;
  }
}
