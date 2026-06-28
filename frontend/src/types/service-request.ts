export type ApiRequestStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'CLOSED';
export type ApiRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ApiRequestSource = 'MAX' | 'TELEGRAM' | 'PHONE' | 'WIDGET' | 'MANUAL';

export interface ApiBuilding {
  id: string;
  name: string;
  address: string;
  city: string | null;
}

export interface ApiServiceRequest {
  id: string;
  number: number;
  title: string;
  description: string | null;
  status: ApiRequestStatus;
  priority: ApiRequestPriority;
  source: ApiRequestSource;
  category: string | null;
  residentName: string | null;
  residentPhone: string | null;
  apartmentLabel: string | null;
  assigneeName: string | null;
  externalChatId: string | null;
  externalMessageId: string | null;
  buildingId: string | null;
  building: ApiBuilding | null;
  assignedToId: string | null;
  createdById: string | null;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Payload for creating a request manually from the UI. */
export interface CreateServiceRequestPayload {
  title: string;
  description?: string;
  priority?: ApiRequestPriority;
  category?: string;
  residentName?: string;
  residentPhone?: string;
  apartmentLabel?: string;
}
