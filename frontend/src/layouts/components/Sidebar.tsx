import { NavLink } from 'react-router-dom';
import { navSectionsForRole } from '@/constants/navigation';
import { Icon, Avatar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { displayName } from '@/utils/format';
import { cn } from '@/utils/cn';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Администратор',
  DISPATCHER: 'Старший диспетчер',
  TECHNICIAN: 'Исполнитель',
  RESIDENT: 'Житель',
};

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const sections = navSectionsForRole(user?.role);
  const name = displayName(user) || 'Пользователь';

  return (
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
        {sections.map((section) => (
          <div key={section.title} className="app-sidebar__section">
            <div className="app-sidebar__section-title">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn('app-sidebar__link', isActive && 'app-sidebar__link--active')
                }
              >
                <span className="app-sidebar__link-icon">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="app-sidebar__link-label">{item.label}</span>
                {item.count !== undefined && (
                  <span className="app-sidebar__link-count">{item.count}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="app-sidebar__footer">
        <Avatar name={name} size="sm" presence="online" />
        <div className="app-sidebar__footer-info">
          <div className="app-sidebar__footer-name">{name}</div>
          <div className="app-sidebar__footer-role">
            {user ? (ROLE_LABEL[user.role] ?? user.role) : ''}
          </div>
        </div>
      </div>
    </aside>
  );
}
