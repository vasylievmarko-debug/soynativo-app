import { create } from 'zustand';
import type { User } from '@soynativo/shared';
import { tokenStorage } from '@shared/api/token-storage';

interface AuthState {
  user: User | null;
  isHydrating: boolean;
  isAuthenticated: boolean;
  hydrate: () => Promise<void>;
  setSession: (user: User, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * Global auth store. Tokens themselves live in SecureStore (see token-storage),
 * we keep only the in-memory derived state (user + isAuthenticated) here.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrating: true,
  isAuthenticated: false,

  hydrate: async () => {
    const token = await tokenStorage.getAccess();
    set({ isAuthenticated: Boolean(token), isHydrating: false });
  },

  setSession: async (user, tokens) => {
    await tokenStorage.setPair(tokens.accessToken, tokens.refreshToken);
    set({ user, isAuthenticated: true });
  },

  clear: async () => {
    await tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },
}));
