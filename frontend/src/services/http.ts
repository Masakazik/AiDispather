import axios, { AxiosError, type AxiosInstance } from 'axios';
import { config } from '@/constants/config';
import type { ApiErrorBody } from '@/types/api';
import { tokenStorage } from './token-storage';

/** Normalized error thrown by the API layer for the UI to consume. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly raw?: ApiErrorBody,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const http: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach bearer token to every request.
http.interceptors.request.use((req) => {
  const token = tokenStorage.get();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Normalize errors and handle expired/invalid sessions.
http.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      // Avoid redirect loops on the login page itself.
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    const body = error.response?.data;
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : (body?.message ?? error.message);
    return Promise.reject(new ApiError(message, error.response?.status ?? 0, body));
  },
);
