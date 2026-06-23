import { http } from './http';
import type { AuthResponse, LoginCredentials } from '@/types/auth';
import type { User } from '@/types/user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await http.get<User>('/auth/me');
    return data;
  },
};
