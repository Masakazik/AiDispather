import { http } from './http';
import type { User } from '@/types/user';

export type StaffRole = 'DISPATCHER' | 'TECHNICIAN';

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  role?: StaffRole;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  isActive?: boolean;
  role?: StaffRole;
  password?: string;
}

export const staffService = {
  async list(): Promise<User[]> {
    const { data } = await http.get<User[]>('/staff');
    return data;
  },
  async create(payload: CreateStaffPayload): Promise<User> {
    const { data } = await http.post<User>('/staff', payload);
    return data;
  },
  async update(id: string, payload: UpdateStaffPayload): Promise<User> {
    const { data } = await http.patch<User>(`/staff/${id}`, payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/staff/${id}`);
  },
};
