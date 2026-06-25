import { http } from './http';

export interface Company {
  id: string;
  name: string;
  inn: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  adminName: string | null;
  adminEmail: string | null;
  usersCount: number;
  requestsCount: number;
}

export interface CreateCompanyPayload {
  name: string;
  inn?: string;
  address?: string;
  phone?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  inn?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  adminName?: string;
  adminEmail?: string;
}

export const adminService = {
  async listCompanies(): Promise<Company[]> {
    const { data } = await http.get<Company[]>('/admin/companies');
    return data;
  },
  async createCompany(payload: CreateCompanyPayload): Promise<Company> {
    const { data } = await http.post<Company>('/admin/companies', payload);
    return data;
  },
  async updateCompany(id: string, payload: UpdateCompanyPayload): Promise<Company> {
    const { data } = await http.patch<Company>(`/admin/companies/${id}`, payload);
    return data;
  },
  async deleteCompany(id: string): Promise<void> {
    await http.delete(`/admin/companies/${id}`);
  },
};
