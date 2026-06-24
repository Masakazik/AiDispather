import { http } from './http';
import type { CreateTaskPayload, Task } from '@/types/task';

export const tasksService = {
  async list(): Promise<Task[]> {
    const { data } = await http.get<Task[]>('/tasks');
    return data;
  },
  async create(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await http.post<Task>('/tasks', payload);
    return data;
  },
  async setDone(id: string, done: boolean): Promise<Task> {
    const { data } = await http.patch<Task>(`/tasks/${id}`, { done });
    return data;
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/tasks/${id}`);
  },
};
