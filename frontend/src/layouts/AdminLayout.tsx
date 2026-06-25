import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Avatar, Button, Icon } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { displayName } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

/** Minimal shell for the platform administrator — no dispatcher features. */
export function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const name = displayName(user) || 'Администратор';

  return (
    <div className="app-shell">
      <aside className={cn('app-sidebar', open && 'app-sidebar--open')}>
        <div className="app-sidebar__brand">
          <span className="app-sidebar__logo">
            <Icon name="IconBuildings" size={20} weight="fill" color="#fff" />
          </span>
          <div className="app-sidebar__title">
            Дом<span className="app-sidebar__title-accent">Диспетчер</span>
          </div>
        </div>

        <nav className="app-sidebar__nav">
          <div className="app-sidebar__section">
            <div className="app-sidebar__section-title">Платформа</div>
            <NavLink
              to={ROUTES.admin}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn('app-sidebar__link', isActive && 'app-sidebar__link--active')}
            >
              <span className="app-sidebar__link-icon">
                <Icon name="IconBuildings" size={18} />
              </span>
              <span className="app-sidebar__link-label">Компании</span>
            </NavLink>
          </div>
        </nav>

        <div className="app-sidebar__footer">
          <Avatar name={name} size="sm" presence="online" />
          <div className="app-sidebar__footer-info">
            <div className="app-sidebar__footer-name">{name}</div>
            <div className="app-sidebar__footer-role">Администратор платформы</div>
          </div>
        </div>
      </aside>
      {open && <div className="app-shell__overlay" onClick={() => setOpen(false)} aria-hidden />}

      <div className="app-shell__main">
        <header className="app-topbar">
          <button
            type="button"
            className="app-topbar__toggle hd-icon-btn"
            aria-label="Меню"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name="IconStack" size={20} />
          </button>
          <div className="app-topbar__titles">
            <div className="app-topbar__title">Панель администратора</div>
            <div className="app-topbar__subtitle">Управляющие компании</div>
          </div>
          <div className="app-topbar__spacer" />
          <Button variant="ghost" size="sm" icon={<Icon name="IconX" size={16} />} onClick={logout}>
            Выйти
          </Button>
        </header>
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
