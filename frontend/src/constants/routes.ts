/** Application route paths in one place to avoid magic strings. */
export const ROUTES = {
  login: '/login',
  dashboard: '/',
  requests: '/requests',
  chats: '/chats',
  residents: '/residents',
  buildings: '/buildings',
  staff: '/staff',
  calendar: '/calendar',
  tasks: '/tasks',
  analytics: '/analytics',
  documents: '/documents',
  settings: '/settings',
  admin: '/admin',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
