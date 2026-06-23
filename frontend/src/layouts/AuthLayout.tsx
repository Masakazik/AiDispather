import { Outlet } from 'react-router-dom';

/** Centered, branded shell for unauthenticated pages (login). */
export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        <Outlet />
      </div>
    </div>
  );
}
