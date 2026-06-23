/** Centralized runtime configuration sourced from Vite env vars. */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  tokenStorageKey: 'homedispatcher.token',
} as const;
