import type { GlyphName } from '@/components/ui';
import type { ApiRequestStatus, ApiServiceRequest } from '@/types/service-request';

const OPEN_STATUSES: ApiRequestStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING'];
const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export const isOpen = (r: ApiServiceRequest) => OPEN_STATUSES.includes(r.status);

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
function sameDay(iso: string | null, day: number): boolean {
  return iso ? startOfDay(new Date(iso)) === day : false;
}
function hhmm(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: GlyphName;
  iconBg: string;
  iconFg: string;
}

export interface DashboardMetrics {
  kpis: Kpi[];
  week: { label: string; incoming: number; resolved: number }[];
  categories: { label: string; count: number; color: string }[];
  statusSegments: { label: string; count: number; color: string }[];
  load: { name: string; count: number }[];
  loadMax: number;
  activity: { time: string; text: string }[];
}

const CATEGORY_PALETTE = [
  'var(--hd-blue-600)',
  'var(--hd-blue-500)',
  'var(--hd-blue-400)',
  'var(--hd-sky-300)',
  'var(--hd-amber-500)',
  'var(--hd-green-500)',
  'var(--hd-neutral-300)',
  'var(--hd-neutral-200)',
];

const STATUS_LABEL: Record<ApiRequestStatus, string> = {
  NEW: 'Новые',
  ASSIGNED: 'Назначенные',
  IN_PROGRESS: 'В работе',
  WAITING: 'Ожидают',
  DONE: 'Выполнены',
  CLOSED: 'Закрыты',
};
const STATUS_COLOR: Record<ApiRequestStatus, string> = {
  NEW: 'var(--hd-neutral-400)',
  ASSIGNED: 'var(--hd-blue-500)',
  IN_PROGRESS: 'var(--hd-amber-500)',
  WAITING: 'var(--hd-neutral-300)',
  DONE: 'var(--hd-green-500)',
  CLOSED: 'var(--hd-neutral-300)',
};

function countBy<T>(items: T[], key: (t: T) => string | null): Map<string, number> {
  const map = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

/** Weekly incoming (created) vs resolved (completed) over the last 7 days. */
function weekSeries(rows: ApiServiceRequest[]) {
  const today = startOfDay(new Date());
  const days: { label: string; incoming: number; resolved: number; day: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = today - i * 86400000;
    days.push({ label: WEEKDAYS[new Date(day).getDay()], incoming: 0, resolved: 0, day });
  }
  for (const r of rows) {
    for (const d of days) {
      if (sameDay(r.createdAt, d.day)) d.incoming += 1;
      if (sameDay(r.completedAt, d.day)) d.resolved += 1;
    }
  }
  return days.map(({ label, incoming, resolved }) => ({ label, incoming, resolved }));
}

export function dashboardMetrics(rows: ApiServiceRequest[]): DashboardMetrics {
  const today = startOfDay(new Date());
  const open = rows.filter(isOpen);
  const criticalOpen = open.filter((r) => r.priority === 'CRITICAL').length;
  const createdToday = rows.filter((r) => sameDay(r.createdAt, today)).length;
  const inProgress = rows.filter((r) => r.status === 'IN_PROGRESS').length;
  const doneToday = rows.filter((r) => r.status === 'DONE' && sameDay(r.completedAt, today)).length;
  const doneTotal = rows.filter((r) => r.status === 'DONE').length;

  const kpis: Kpi[] = [
    {
      label: 'Открытые заявки',
      value: String(open.length),
      sub: criticalOpen ? `из них ${criticalOpen} аварийные` : 'нет аварийных',
      icon: 'IconStack',
      iconBg: 'var(--surface-brand-subtle)',
      iconFg: 'var(--hd-blue-600)',
    },
    {
      label: 'Новые за сегодня',
      value: String(createdToday),
      sub: 'поступило сегодня',
      icon: 'IconTicket',
      iconBg: 'var(--status-info-bg)',
      iconFg: 'var(--hd-blue-600)',
    },
    {
      label: 'В работе',
      value: String(inProgress),
      sub: 'выполняется',
      icon: 'IconArrowsDownUp',
      iconBg: 'var(--status-warning-bg)',
      iconFg: 'var(--status-warning-solid)',
    },
    {
      label: 'Выполнено сегодня',
      value: String(doneToday),
      sub: `всего выполнено: ${doneTotal}`,
      icon: 'IconCheckCircle',
      iconBg: 'var(--status-success-bg)',
      iconFg: 'var(--status-success-solid)',
    },
  ];

  const categories = [...countBy(rows, (r) => r.category).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count], i) => ({ label, count, color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }));

  const statusSegments = (['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING', 'DONE'] as ApiRequestStatus[])
    .map((s) => ({
      label: STATUS_LABEL[s],
      count: rows.filter((r) => r.status === s).length,
      color: STATUS_COLOR[s],
    }))
    .filter((s) => s.count > 0);

  const load = [...countBy(open, (r) => r.assigneeName).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));
  const loadMax = Math.max(1, ...load.map((l) => l.count));

  const activity = [...rows]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)
    .map((r) => ({
      time: hhmm(r.updatedAt),
      text: `Заявка #${r.number} «${r.title}» — ${STATUS_LABEL[r.status].toLowerCase()}`,
    }));

  return { kpis, week: weekSeries(rows), categories, statusSegments, load, loadMax, activity };
}

export interface AnalyticsMetrics {
  kpis: { label: string; value: string }[];
  week: { label: string; incoming: number; resolved: number }[];
  categories: { label: string; count: number; color: string }[];
  byBuilding: { name: string; count: number }[];
  buildingMax: number;
}

export function analyticsMetrics(rows: ApiServiceRequest[]): AnalyticsMetrics {
  const open = rows.filter(isOpen);
  const done = rows.filter((r) => r.status === 'DONE');
  const critical = rows.filter((r) => r.priority === 'CRITICAL');
  const inProgress = rows.filter((r) => r.status === 'IN_PROGRESS');
  const fromMax = rows.filter((r) => r.source === 'MAX');

  const kpis = [
    { label: 'Всего заявок', value: String(rows.length) },
    { label: 'Открытых', value: String(open.length) },
    { label: 'Выполнено', value: String(done.length) },
    { label: 'В работе', value: String(inProgress.length) },
    { label: 'Аварийных', value: String(critical.length) },
    { label: 'Из мессенджера MAX', value: String(fromMax.length) },
  ];

  const categories = [...countBy(rows, (r) => r.category).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count], i) => ({ label, count, color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }));

  const byBuilding = [...countBy(rows, (r) => r.building?.name ?? null).entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  const buildingMax = Math.max(1, ...byBuilding.map((b) => b.count));

  return { kpis, week: weekSeries(rows), categories, byBuilding, buildingMax };
}
