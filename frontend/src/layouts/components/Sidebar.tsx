import { NavLink } from 'react-router-dom';
import { NAV_SECTIONS } from '@/constants/navigation';
import { Icon, Avatar } from '@/components/ui';
import { cn } from '@/utils/cn';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
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
        {NAV_SECTIONS.map((section) => (
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
        <Avatar name="Дарья Морозова" size="sm" presence="online" />
        <div className="app-sidebar__footer-info">
          <div className="app-sidebar__footer-name">Дарья Морозова</div>
          <div className="app-sidebar__footer-role">Старший диспетчер</div>
        </div>
      </div>
    </aside>
  );
}
