import type {
  Building,
  CommentEntry,
  Resident,
  Ticket,
  TimelineEntry,
} from '@/types/dispatch';
import { BUILDINGS, PRIO, STATUS, TICKETS } from './data';

export function buildingById(id: string): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

export function slaColor(state: Ticket['slaState']): string {
  if (state === 'over') return 'var(--status-error-fg)';
  if (state === 'warn') return 'var(--status-warning-fg)';
  return 'var(--text-tertiary)';
}

export interface DecoratedTicket extends Ticket {
  statusLabel: string;
  statusColorKey: Ticket['status'];
  statusDot: string;
  prioLabel: string;
  buildingName: string;
  corp: string;
  addressShort: string;
  slaColorValue: string;
}

export function decorateTicket(t: Ticket): DecoratedTicket {
  const st = STATUS[t.status];
  const pr = PRIO[t.priority];
  const b = buildingById(t.bId);
  return {
    ...t,
    statusLabel: st.label,
    statusColorKey: t.status,
    statusDot: st.dot,
    prioLabel: pr.label,
    buildingName: b?.name ?? '',
    corp: b?.corp ?? '',
    addressShort: `${(b?.name ?? '').replace('ЖК ', '')} · ${t.apt}`,
    slaColorValue: slaColor(t.slaState),
  };
}

const tlDot = (c: string) => c;

export function ticketTimeline(t: Ticket): TimelineEntry[] {
  const timeline: TimelineEntry[] = [];
  timeline.push({
    label: t.source === 'Телефон' ? 'Звонок жителя принят' : `Обращение получено из «${t.source}»`,
    who: t.created,
    dot: tlDot('var(--hd-neutral-400)'),
  });
  timeline.push({
    label: `ИИ определил категорию «${t.category}» — ${t.aiConf}%`,
    who: 'AI Домовей · авто',
    dot: tlDot('var(--hd-blue-500)'),
  });
  if (t.emergency)
    timeline.push({ label: 'Эскалация на аварийную бригаду', who: t.created, dot: tlDot('var(--hd-red-500)') });
  if (t.assignee)
    timeline.push({ label: `Назначен исполнитель: ${t.assignee}`, who: t.created, dot: tlDot('var(--hd-amber-500)') });
  if (t.status === 'in_progress')
    timeline.push({ label: 'Исполнитель приступил к работам', who: t.updated, dot: tlDot('var(--hd-amber-500)') });
  if (t.status === 'done')
    timeline.push({ label: 'Работы выполнены и подтверждены', who: t.updated, dot: tlDot('var(--hd-green-500)') });
  return timeline;
}

export function ticketComments(t: Ticket): CommentEntry[] {
  const comments: CommentEntry[] = [
    { who: 'AI Домовей', ai: true, time: t.created.split('· ')[1] ?? '07:31', text: t.aiNote },
  ];
  if (t.assignee)
    comments.push({
      who: t.assignee,
      ai: false,
      time: '08:05',
      text: 'Принято в работу, выезжаю на объект. Сообщу о результате.',
    });
  return comments;
}

export interface DecoratedResident extends Resident {
  buildingName: string;
  corp: string;
  address: string;
  statusLabel: string;
  statusColor: 'success' | 'error';
  debtText: string;
  tickets: DecoratedTicket[];
}

export function decorateResident(r: Resident): DecoratedResident {
  const b = buildingById(r.bId);
  const surname = r.name.split(' ')[0];
  const tickets = TICKETS.filter((t) => t.resident.startsWith(surname)).map(decorateTicket);
  return {
    ...r,
    buildingName: b?.name ?? '',
    corp: b?.corp ?? '',
    address: `${b?.name ?? ''} · ${b?.corp ?? ''} · ${r.apt}`,
    statusLabel: r.status === 'debt' ? 'Задолженность' : 'Активный',
    statusColor: r.status === 'debt' ? 'error' : 'success',
    debtText: r.debt > 0 ? `${r.debt.toLocaleString('ru-RU')} ₽` : '—',
    tickets,
  };
}

export function assigneeShortName(fullName: string): string {
  const parts = fullName.split(' ');
  if (parts.length < 3) return fullName;
  return `${parts[0]} ${parts[1][0]}.${parts[2][0]}.`;
}
