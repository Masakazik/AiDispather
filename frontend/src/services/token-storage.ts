import { config } from '@/constants/config';

/** Single source of truth for reading/writing the auth token. */
export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(config.tokenStorageKey);
  },
  set(token: string): void {
    localStorage.setItem(config.tokenStorageKey, token);
  },
  clear(): void {
    localStorage.removeItem(config.tokenStorageKey);
  },
};
