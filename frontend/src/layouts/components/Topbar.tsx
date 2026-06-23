import { useRef } from 'react';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';
import { Icon, Avatar, SearchInput } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { displayName } from '@/utils/format';

interface TopbarProps {
  title: string;
  subtitle: string;
  onToggleSidebar: () => void;
}

export function Topbar({ title, subtitle, onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuth();
  const menuRef = useRef<Menu>(null);

  const menuItems: MenuItem[] = [
    { label: displayName(user) || 'Дарья Морозова', disabled: true },
    { separator: true },
    { label: 'Выйти', icon: 'pi pi-sign-out', command: logout },
  ];

  return (
    <header className="app-topbar">
      <button
        type="button"
        className="app-topbar__toggle hd-icon-btn"
        aria-label="Меню"
        onClick={onToggleSidebar}
      >
        <Icon name="IconStack" size={20} />
      </button>

      <div className="app-topbar__titles">
        <div className="app-topbar__title">{title}</div>
        <div className="app-topbar__subtitle">{subtitle}</div>
      </div>

      <div className="app-topbar__spacer" />

      <div className="app-topbar__search">
        <SearchInput placeholder="Поиск…" shortcut="/" />
      </div>

      <div className="app-topbar__ai">
        <span className="app-topbar__ai-dot" />
        <span>ИИ активен</span>
      </div>

      <button type="button" className="app-topbar__bell hd-icon-btn" aria-label="Уведомления">
        <Icon name="IconBell" size={20} />
        <span className="app-topbar__bell-badge" />
      </button>

      <Menu model={menuItems} popup ref={menuRef} />
      <button
        type="button"
        className="app-topbar__avatar-btn"
        aria-label="Меню пользователя"
        onClick={(e) => menuRef.current?.toggle(e)}
      >
        <Avatar name={displayName(user) || 'Дарья Морозова'} size="sm" />
      </button>
    </header>
  );
}
