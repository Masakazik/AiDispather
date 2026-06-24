import { http } from './http';
import type {
  ApiRequestStatus,
  ApiServiceRequest,
  CreateServiceRequestPayload,
  PaginatedResult,
} from '@/types/service-request';

export interface ServiceRequestQuery {
  status?: string;
  priority?: string;
  page?: number;
  pageSize?: number;
}

export const serviceRequestsService = {
  async list(query: ServiceRequestQuery = {}): Promise<PaginatedResult<ApiServiceRequest>> {
    const { data } = await http.get<PaginatedResult<ApiServiceRequest>>('/service-requests', {
      params: { pageSize: 100, ...query },
    });
    return data;
  },

  async getById(id: string): Promise<ApiServiceRequest> {
    const { data } = await http.get<ApiServiceRequest>(`/service-requests/${id}`);
    return data;
  },

  async create(payload: CreateServiceRequestPayload): Promise<ApiServiceRequest> {
    const { data } = await http.post<ApiServiceRequest>('/service-requests', payload);
    return data;
  },

  async updateStatus(id: string, status: ApiRequestStatus): Promise<ApiServiceRequest> {
    const { data } = await http.patch<ApiServiceRequest>(`/service-requests/${id}`, { status });
    return data;
  },

  async assign(id: string, assigneeName: string): Promise<ApiServiceRequest> {
    const { data } = await http.patch<ApiServiceRequest>(`/service-requests/${id}`, {
      assigneeName,
      status: 'ASSIGNED',
    });
    return data;
  },
};
