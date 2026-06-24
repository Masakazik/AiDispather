import { create } from 'zustand';
import type { CreateTaskPayload, Task } from '@/types/task';
import { tasksService } from '@/services/tasks.service';

interface TasksState {
  items: Task[];
  loaded: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
  create: (payload: CreateTaskPayload) => Promise<Task>;
  toggle: (id: string, done: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  items: [],
  loaded: false,
  loading: false,

  fetch: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const items = await tasksService.list();
      set({ items, loaded: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    const task = await tasksService.create(payload);
    set({ items: [task, ...get().items] });
    return task;
  },

  toggle: async (id, done) => {
    const updated = await tasksService.setDone(id, done);
    set({ items: get().items.map((t) => (t.id === id ? updated : t)) });
  },

  remove: async (id) => {
    await tasksService.remove(id);
    set({ items: get().items.filter((t) => t.id !== id) });
  },
}));
