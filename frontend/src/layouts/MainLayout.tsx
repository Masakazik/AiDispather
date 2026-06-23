import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ALL_SCREENS } from '@/constants/navigation';
import { TicketDrawer } from '@/features/dispatch/components/TicketDrawer';
import { ResidentDrawer } from '@/features/dispatch/components/ResidentDrawer';

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
