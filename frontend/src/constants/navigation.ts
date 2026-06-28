import type { GlyphName } from '@/components/ui';
import type { UserRole } from '@/types/user';
import { ROUTES } from './routes';

export interface NavScreen {
  id: string;
  label: string;
  icon: GlyphName;
  to: string;
  /** Header subtitle shown in the topbar for this screen. */
  sub: string;
  count?: number;
  /** When set, the item is only shown to users with one of these roles. */
  roles?: UserRole[];
}

export interface NavSection {
  title: string;
  items: NavScreen[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Рабочая область',
    items: [
      { id: 'dashboard', label: 'Дашборд', icon: 'IconGauge', to: ROUTES.dashboard, sub: 'Обзор по всем объектам' },
      { id: 'requests', label: 'Заявки', icon: 'IconTicket', to: ROUTES.requests, sub: 'Управление обращениями' },
      { id: 'chats', label: 'Чаты (в работе)', icon: 'IconChatsTeardrop', to: ROUTES.chats, sub: 'Сообщения по домам' },
      { id: 'buildings', label: 'Дома (в разработке)', icon: 'IconBuildings', to: ROUTES.buildings, sub: 'Список домов УК' },
      { id: 'staff', label: 'Сотрудники', icon: 'IconIdentificationBadge', to: ROUTES.staff, sub: 'Команда и исполнители' },
    ],
  },
  {
    title: 'Планирование',
    items: [
      { id: 'calendar', label: 'Календарь', icon: 'IconCalendarBlank', to: ROUTES.calendar, sub: 'Плановые работы и задачи' },
      { id: 'tasks', label: 'Задачи', icon: 'IconChecks', to: ROUTES.tasks, sub: 'Внутренние задачи команды' },
      { id: 'analytics', label: 'Аналитика', icon: 'IconChartBar', to: ROUTES.analytics, sub: 'Показатели по заявкам' },
    ],
  },
  {
    title: 'Система',
    items: [
      { id: 'documents', label: 'Документы', icon: 'IconFiles', to: ROUTES.documents, sub: 'Архив документов' },
    ],
  },
];

/** Filters nav sections by the current user's role, dropping empty sections. */
export function navSectionsForRole(role: UserRole | undefined): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || (role && item.roles.includes(role))),
  })).filter((section) => section.items.length > 0);
}

export const ALL_SCREENS: NavScreen[] = NAV_SECTIONS.flatMap((s) => s.items);
