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
      { id: 'dashboard', label: 'Дашборд', icon: 'IconGauge', to: ROUTES.dashboard, sub: 'Обзор по всем объектам · 21 июня 2026' },
      { id: 'requests', label: 'Заявки', icon: 'IconTicket', to: ROUTES.requests, sub: '14 активных · 2 аварийные', count: 14 },
      { id: 'residents', label: 'Жители', icon: 'IconUsersThree', to: ROUTES.residents, sub: 'База жителей' },
      { id: 'buildings', label: 'Дома', icon: 'IconBuildings', to: ROUTES.buildings, sub: '6 домов в управлении' },
      { id: 'staff', label: 'Сотрудники', icon: 'IconIdentificationBadge', to: ROUTES.staff, sub: '7 сотрудников на смене' },
    ],
  },
  {
    title: 'Планирование',
    items: [
      { id: 'calendar', label: 'Календарь', icon: 'IconCalendarBlank', to: ROUTES.calendar, sub: 'Июнь 2026' },
      { id: 'tasks', label: 'Задачи', icon: 'IconChecks', to: ROUTES.tasks, sub: 'Внутренние задачи команды', count: 4 },
      { id: 'analytics', label: 'Аналитика', icon: 'IconChartBar', to: ROUTES.analytics, sub: 'За последние 30 дней' },
    ],
  },
  {
    title: 'Система',
    items: [
      { id: 'documents', label: 'Документы', icon: 'IconFiles', to: ROUTES.documents, sub: 'Архив документов' },
      { id: 'settings', label: 'Настройки', icon: 'IconGearSix', to: ROUTES.settings, sub: 'Конфигурация системы' },
    ],
  },
];

export const ALL_SCREENS: NavScreen[] = NAV_SECTIONS.flatMap((s) => s.items);
