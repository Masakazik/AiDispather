import type { GlyphName } from '@/components/ui';
import { ROUTES } from './routes';

export interface NavScreen {
  id: string;
  label: string;
  icon: GlyphName;
  to: string;
  /** Header subtitle shown in the topbar for this screen. */
  sub: string;
  count?: number;
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

export const ALL_SCREENS: NavScreen[] = NAV_SECTIONS.flatMap((s) => s.items);
