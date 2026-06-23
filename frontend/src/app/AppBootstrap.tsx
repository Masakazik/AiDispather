import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';

/** Restores the session once on app start before rendering routes. */
export function AppBootstrap({ children }: { children: ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return <>{children}</>;
}
