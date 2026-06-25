import { create } from 'zustand';
import type { User } from '@/types/user';
import {
  staffService,
  type CreateStaffPayload,
  type UpdateStaffPayload,
} from '@/services/staff.service';

interface StaffState {
  items: User[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (payload: CreateStaffPayload) => Promise<User>;
  update: (id: string, payload: UpdateStaffPayload) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await staffService.list();
      set({ items, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Не удалось загрузить сотрудников' });
    }
  },

  create: async (payload) => {
    const user = await staffService.create(payload);
    set({ items: [...get().items, user] });
    return user;
  },

  update: async (id, payload) => {
    const updated = await staffService.update(id, payload);
    set({ items: get().items.map((u) => (u.id === id ? updated : u)) });
  },

  remove: async (id) => {
    await staffService.remove(id);
    set({ items: get().items.filter((u) => u.id !== id) });
  },
}));
