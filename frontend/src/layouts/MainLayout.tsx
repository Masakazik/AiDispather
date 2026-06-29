import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ALL_SCREENS } from '@/constants/navigation';
import { TicketDrawer } from '@/features/dispatch/components/TicketDrawer';
import { ResidentDrawer } from '@/features/dispatch/components/ResidentDrawer';
import { useAuthStore } from '@/store/auth.store';
import { useRequestsStore } from '@/store/requests.store';
import { useTasksStore } from '@/store/tasks.store';
import { connectRealtime, disconnectRealtime, onRealtimeEvent } from '@/services/realtime.service';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const screen = useCurrentScreen();
  const token = useAuthStore((s) => s.token);
  const fetchRequests = useRequestsStore((s) => s.fetch);
  const fetchTasks = useTasksStore((s) => s.fetch);

  // Load live data once for the whole authenticated app.
  useEffect(() => {
    void fetchRequests();
    void fetchTasks();
  }, [fetchRequests, fetchTasks]);

  // Live updates: subscribe to websocket events from backend.
  useEffect(() => {
    const socket = connectRealtime(token);
    if (!socket) return;
    const offRequests = onRealtimeEvent('requests.updated', () => {
      void fetchRequests();
    });
    return () => {
      offRequests();
      disconnectRealtime();
    };
  }, [token, fetchRequests]);

  // Focus/visibility fallback refresh.
  useEffect(() => {
    const onFocus = () => void fetchRequests();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchRequests();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
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
