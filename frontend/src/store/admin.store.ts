import { create } from 'zustand';
import {
  adminService,
  type Company,
  type CreateCompanyPayload,
  type UpdateCompanyPayload,
} from '@/services/admin.service';

interface AdminState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (payload: CreateCompanyPayload) => Promise<Company>;
  update: (id: string, payload: UpdateCompanyPayload) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  companies: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const companies = await adminService.listCompanies();
      set({ companies, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Не удалось загрузить компании' });
    }
  },

  create: async (payload) => {
    const company = await adminService.createCompany(payload);
    set({ companies: [company, ...get().companies] });
    return company;
  },

  update: async (id, payload) => {
    const updated = await adminService.updateCompany(id, payload);
    set({ companies: get().companies.map((c) => (c.id === id ? updated : c)) });
  },

  remove: async (id) => {
    await adminService.deleteCompany(id);
    set({ companies: get().companies.filter((c) => c.id !== id) });
  },
}));
