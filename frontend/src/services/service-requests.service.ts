import { http } from './http';
import type { PaginatedResult, ServiceRequest } from '@/types/service-request';

export interface ServiceRequestQuery {
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
}

export const serviceRequestsService = {
  async list(query: ServiceRequestQuery = {}): Promise<PaginatedResult<ServiceRequest>> {
    const { data } = await http.get<PaginatedResult<ServiceRequest>>('/service-requests', {
      params: query,
    });
    return data;
  },

  async getById(id: string): Promise<ServiceRequest> {
    const { data } = await http.get<ServiceRequest>(`/service-requests/${id}`);
    return data;
  },
};
