/** Centralized runtime configuration sourced from Vite env vars. */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL ?? window.location.origin,
  tokenStorageKey: 'homedispatcher.token',
  maxMessageUrlTemplate:
    import.meta.env.VITE_MAX_MESSAGE_URL_TEMPLATE ?? 'https://max.ru/chat/{chatId}?message={messageId}',
} as const;
