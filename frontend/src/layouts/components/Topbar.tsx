import { useRef } from 'react';
import { Menu } from 'primereact/menu';
import { OverlayPanel } from 'primereact/overlaypanel';
import type { MenuItem } from 'primereact/menuitem';
import { Icon, Avatar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { displayName } from '@/utils/format';
import { useRequestsStore } from '@/store/requests.store';
import { useTasksStore } from '@/store/tasks.store';
import { useDispatchStore } from '@/store/dispatch.store';

interface TopbarProps {
  title: string;
  subtitle: string;
  onToggleSidebar: () => void;
}

const isToday = (iso: string | null): boolean => {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};

export function Topbar({ title, subtitle, onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuth();
  const menuRef = useRef<Menu>(null);
  const notifRef = useRef<OverlayPanel>(null);

  const items = useRequestsStore((s) => s.items);
  const tasks = useTasksStore((s) => s.items);
  const openTicket = useDispatchStore((s) => s.openTicket);

  const newRequests = items.filter((t) => t.status === 'new');
  const todayTasks = tasks.filter((t) => !t.done && isToday(t.dueDate));
  const notifCount = newRequests.length + todayTasks.length;

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

      <div className="app-topbar__ai">
        <span className="app-topbar__ai-dot" />
        <span>ИИ активен</span>
      </div>

      <button
        type="button"
        className="app-topbar__bell hd-icon-btn"
        aria-label="Уведомления"
        onClick={(e) => notifRef.current?.toggle(e)}
      >
        <Icon name="IconBell" size={20} />
        {notifCount > 0 && <span className="app-topbar__bell-badge" />}
      </button>

      <OverlayPanel ref={notifRef} className="notif-panel">
        <div className="notif">
          <div className="notif__title">Уведомления</div>

          <div className="notif__section-label">Новые заявки · {newRequests.length}</div>
          {newRequests.length === 0 && <div className="notif__empty">Новых заявок нет</div>}
          {newRequests.slice(0, 5).map((t) => (
            <button
              key={t.id}
              className="notif__row"
              onClick={() => {
                openTicket(t.id);
                notifRef.current?.hide();
              }}
            >
              <span className="notif__dot" style={{ background: 'var(--hd-blue-500)' }} />
              <span className="notif__num tabular">{t.num}</span>
              <span className="notif__text">{t.title}</span>
            </button>
          ))}

          <div className="notif__section-label">Задачи на сегодня · {todayTasks.length}</div>
          {todayTasks.length === 0 && <div className="notif__empty">На сегодня задач нет</div>}
          {todayTasks.slice(0, 5).map((t) => (
            <div key={t.id} className="notif__row notif__row--static">
              <span className="notif__dot" style={{ background: 'var(--hd-amber-500)' }} />
              <span className="notif__text">{t.title}</span>
            </div>
          ))}
        </div>
      </OverlayPanel>

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
