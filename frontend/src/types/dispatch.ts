import type { BadgeColor } from '@/components/ui';
import type { GlyphName } from '@/components/ui';

export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'waiting' | 'done' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type SlaState = 'ok' | 'warn' | 'over';
export type Presence = 'online' | 'away' | 'offline';

export interface StatusMeta {
  label: string;
  color: BadgeColor;
  dot: string;
}
export interface PriorityMeta {
  label: string;
  color: BadgeColor;
}

export interface Building {
  id: string;
  name: string;
  corp: string;
  addr: string;
  apts: number;
  manager: string;
  active: number;
  emergency: number;
  sla: number;
}

export interface Resident {
  id: string;
  name: string;
  phone: string;
  bId: string;
  apt: string;
  reqs: number;
  status: 'active' | 'debt';
  debt: number;
}

export interface Ticket {
  id: string;
  num: string;
  title: string;
  desc: string;
  category: string;
  catIcon: GlyphName;
  priority: TicketPriority;
  status: TicketStatus;
  bId: string;
  /** Resolved building name from live data (overrides the static lookup when present). */
  buildingName?: string;
  apt: string;
  resident: string;
  phone: string;
  assignee: string | null;
  created: string;
  updated: string;
  sla: string;
  slaState: SlaState;
  tags: string[];
  photos: number;
  chat: number;
  source: string;
  ai: boolean;
  aiConf: number;
  aiNote: string;
  emergency: boolean;
  dup?: boolean;
}

export interface MaintenanceItem {
  title: string;
  date: string;
  day: number;
  building: string;
  type: string;
  color: string;
}

export interface ActivityItem {
  time: string;
  text: string;
  tone: 'ai' | 'info' | 'success' | 'error';
}

export interface TeamTask {
  id: string;
  title: string;
  assignee: string;
  due: string;
  priority: TicketPriority;
  done: boolean;
}

export interface DocItem {
  name: string;
  type: string;
  size: string;
  date: string;
  color: string;
}

export interface TimelineEntry {
  label: string;
  who: string;
  dot: string;
}
export interface CommentEntry {
  who: string;
  ai: boolean;
  time: string;
  text: string;
}
