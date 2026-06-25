import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { AdminRoute } from '@/components/routing/AdminRoute';
import { AppRoute } from '@/components/routing/AppRoute';
import { PublicOnlyRoute } from '@/components/routing/PublicOnlyRoute';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ROUTES } from '@/constants/routes';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const RequestsPage = lazy(() => import('@/pages/RequestsPage'));
const StaffPage = lazy(() => import('@/pages/StaffPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageFallback() {
  return (
    <div className="app-center-screen">
      <ProgressSpinner strokeWidth="3" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* Platform admin area — separate minimal shell, SUPERADMIN only */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.admin} element={<AdminPage />} />
            </Route>
          </Route>

          {/* Main dispatcher app — management companies and their staff */}
          <Route element={<AppRoute />}>
            <Route element={<MainLayout />}>
              <Route path={ROUTES.dashboard} element={<DashboardPage />} />
              <Route path={ROUTES.requests} element={<RequestsPage />} />
              <Route path={ROUTES.staff} element={<StaffPage />} />
              <Route path={ROUTES.calendar} element={<CalendarPage />} />
              <Route path={ROUTES.tasks} element={<TasksPage />} />
              <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
              <Route path={ROUTES.documents} element={<DocumentsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
