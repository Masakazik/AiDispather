import { create } from 'zustand';
import type { CreateEmployeePayload, Employee } from '@/types/employee';
import { employeesService } from '@/services/employees.service';

interface EmployeesState {
  items: Employee[];
  loaded: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
  create: (payload: CreateEmployeePayload) => Promise<Employee>;
  remove: (id: string) => Promise<void>;
}

export const useEmployeesStore = create<EmployeesState>((set, get) => ({
  items: [],
  loaded: false,
  loading: false,

  fetch: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const items = await employeesService.list();
      set({ items, loaded: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    const created = await employeesService.create(payload);
    set({ items: [...get().items, created] });
    return created;
  },

  remove: async (id) => {
    await employeesService.remove(id);
    set({ items: get().items.filter((e) => e.id !== id) });
  },
}));
