import { Navigate, Outlet } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

/** Platform-admin area gate — SUPERADMIN only; everyone else goes to the app. */
export function AdminRoute() {
  const { user, status } = useAuth();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="app-center-screen">
        <ProgressSpinner strokeWidth="3" />
      </div>
    );
  }

  if (user?.role !== 'SUPERADMIN') {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
