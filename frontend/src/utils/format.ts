import type { User } from '@/types/user';

/** Human-readable full name with email fallback. */
export function displayName(user: Pick<User, 'firstName' | 'lastName' | 'email'> | null): string {
  if (!user) return '';
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.email;
}

/** Initials for avatars, e.g. "Jane Doe" -> "JD". */
export function initials(user: Pick<User, 'firstName' | 'lastName' | 'email'> | null): string {
  if (!user) return '?';
  const a = user.firstName?.[0] ?? '';
  const b = user.lastName?.[0] ?? '';
  const combined = `${a}${b}`.toUpperCase();
  return combined || user.email[0]?.toUpperCase() || '?';
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}
