import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ALL_SCREENS } from '@/constants/navigation';
import { TicketDrawer } from '@/features/dispatch/components/TicketDrawer';
import { ResidentDrawer } from '@/features/dispatch/components/ResidentDrawer';
import { useRequestsStore } from '@/store/requests.store';
import { useTasksStore } from '@/store/tasks.store';

function useCurrentScreen() {
  const { pathname } = useLocation();
  const match =
    ALL_SCREENS.find((s) => s.to === pathname) ??
    ALL_SCREENS.find((s) => s.to !== '/' && pathname.startsWith(s.to)) ??
    ALL_SCREENS[0];
  return match;
}

/** Authenticated application shell: responsive sidebar + topbar + content. */
export function MainLayout() {
  const REQUESTS_POLL_MS = 10_000;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const screen = useCurrentScreen();
  const fetchRequests = useRequestsStore((s) => s.fetch);
  const fetchTasks = useTasksStore((s) => s.fetch);

  // Load live data once for the whole authenticated app.
  useEffect(() => {
    void fetchRequests();
    void fetchTasks();
  }, [fetchRequests, fetchTasks]);

  // Keep requests in sync with backend updates (bot/manual/other users)
  // so new tickets appear without a page reload.
  useEffect(() => {
    const timer = window.setInterval(() => {
      void fetchRequests();
    }, REQUESTS_POLL_MS);

    const onFocus = () => void fetchRequests();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchRequests();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchRequests]);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div className="app-shell__overlay" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}
      <div className="app-shell__main">
        <Topbar
          title={screen.label}
          subtitle={screen.sub}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>

      {/* Global drawers, openable from any screen */}
      <TicketDrawer />
      <ResidentDrawer />
    </div>
  );
}
