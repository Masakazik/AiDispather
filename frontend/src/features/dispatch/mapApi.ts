import type { GlyphName } from '@/components/ui';
import type { Ticket, TicketPriority, TicketStatus } from '@/types/dispatch';
import type { ApiRequestSource, ApiServiceRequest } from '@/types/service-request';

const SOURCE_LABEL: Record<ApiRequestSource, string> = {
  MAX: 'MAX',
  TELEGRAM: 'Telegram',
  PHONE: 'Телефон',
  WIDGET: 'Виджет',
  MANUAL: 'Вручную',
};

const CATEGORY_ICON: Record<string, GlyphName> = {
  Лифт: 'IconArrowsDownUp',
  Сантехника: 'IconDrop',
  Водоснабжение: 'IconThermometer',
  Отопление: 'IconThermometer',
  Шум: 'IconBell',
  Доступ: 'IconKey',
  Благоустройство: 'IconTrash',
  Начисления: 'IconFileText',
  Авария: 'IconWarningOctagon',
  Безопасность: 'IconShieldWarning',
  'Обратная связь': 'IconCheckCircle',
  Электрика: 'IconLightning',
  электричество: 'IconLightning',
};

function categoryIcon(category: string | null): GlyphName {
  if (!category) return 'IconTicket';
  return CATEGORY_ICON[category] ?? CATEGORY_ICON[category.toLowerCase()] ?? 'IconTicket';
}

function formatCreated(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm} · ${hh}:${mi}`;
}

function relativeTime(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} ч назад`;
  return `${Math.round(diffH / 24)} дн назад`;
}

/** Maps a backend service request to the frontend Ticket shape used by the screens. */
export function apiToTicket(row: ApiServiceRequest): Ticket {
  const status = row.status.toLowerCase() as TicketStatus;
  const priority = row.priority.toLowerCase() as TicketPriority;
  return {
    id: row.id,
    num: `#${row.number}`,
    title: row.title,
    desc: row.description ?? '',
    category: row.category ?? 'Прочее',
    catIcon: categoryIcon(row.category),
    priority,
    status,
    bId: row.buildingId ?? '',
    buildingName: row.building?.name ?? '',
    apt: row.apartmentLabel ?? '—',
    resident: row.residentName ?? '—',
    phone: row.residentPhone ?? '',
    assignee: row.assigneeName,
    created: formatCreated(row.createdAt),
    updated: relativeTime(row.updatedAt),
    sla: '',
    slaState: 'ok',
    tags: row.category ? [row.category] : [],
    photos: 0,
    chat: 0,
    source: SOURCE_LABEL[row.source],
    ai: Boolean(row.description),
    aiConf: 0,
    aiNote: row.description ?? '',
    emergency: priority === 'critical',
  };
}
