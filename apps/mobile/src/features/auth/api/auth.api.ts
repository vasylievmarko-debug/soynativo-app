import { http } from '@shared/api/http';
import type { User } from '@soynativo/shared';

interface AuthResult {
  user: User;
  tokens: { accessToken: string; refreshToken: string };
}

export const authApi = {
  login: (email: string, password: string) =>
    http.post<AuthResult>('/auth/login', { email, password }).then((r) => r.data),
  refresh: (refreshToken: string) =>
    http.post<{ tokens: AuthResult['tokens'] }>('/auth/refresh', { refreshToken }).then((r) => r.data),
  logout: () => http.post('/auth/logout').then((r) => r.data),
};
