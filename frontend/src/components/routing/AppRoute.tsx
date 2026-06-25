import { Navigate, Outlet } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

/**
 * Main dispatcher app gate. The platform admin (SUPERADMIN) has no company data,
 * so they are redirected to the admin area instead of the app shell.
 */
export function AppRoute() {
  const { user, status } = useAuth();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="app-center-screen">
        <ProgressSpinner strokeWidth="3" />
      </div>
    );
  }

  if (user?.role === 'SUPERADMIN') {
    return <Navigate to={ROUTES.admin} replace />;
  }

  return <Outlet />;
}
