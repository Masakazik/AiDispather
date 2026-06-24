import { http } from './http';
import type { CreateEmployeePayload, Employee } from '@/types/employee';

export const employeesService = {
  async list(): Promise<Employee[]> {
    const { data } = await http.get<Employee[]>('/employees');
    return data;
  },
  async create(payload: CreateEmployeePayload): Promise<Employee> {
    const { data } = await http.post<Employee>('/employees', payload);
    return data;
  },
  async remove(id: string): Promise<void> {
    await http.delete(`/employees/${id}`);
  },
};
