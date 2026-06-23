import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/store/auth.store';

/** Convenience selector hook exposing auth state and actions. */
export const useAuth = () =>
  useAuthStore(
    useShallow((state) => ({
      user: state.user,
      token: state.token,
      status: state.status,
      error: state.error,
      isAuthenticated: state.status === 'authenticated',
      login: state.login,
      logout: state.logout,
      bootstrap: state.bootstrap,
      clearError: state.clearError,
    })),
  );
