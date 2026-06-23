import { create } from 'zustand';
import { authService } from '@/services/auth.service';
import { tokenStorage } from '@/services/token-storage';
import type { LoginCredentials } from '@/types/auth';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  /** Restore session on app boot using a persisted token. */
  bootstrap: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: tokenStorage.get(),
  status: 'idle',
  error: null,

  login: async (credentials) => {
    set({ status: 'loading', error: null });
    try {
      const { accessToken, user } = await authService.login(credentials);
      tokenStorage.set(accessToken);
      set({ user, token: accessToken, status: 'authenticated', error: null });
    } catch (err) {
      set({
        status: 'unauthenticated',
        error: err instanceof Error ? err.message : 'Login failed',
      });
      throw err;
    }
  },

  logout: () => {
    tokenStorage.clear();
    set({ user: null, token: null, status: 'unauthenticated', error: null });
  },

  bootstrap: async () => {
    const token = tokenStorage.get();
    if (!token) {
      set({ status: 'unauthenticated' });
      return;
    }
    set({ status: 'loading' });
    try {
      const user = await authService.me();
      set({ user, token, status: 'authenticated' });
    } catch {
      tokenStorage.clear();
      set({ user: null, token: null, status: 'unauthenticated' });
    }
  },

  clearError: () => set({ error: null }),
}));
