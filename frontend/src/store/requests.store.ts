import { create } from 'zustand';
import type { Ticket, TicketStatus } from '@/types/dispatch';
import type {
  ApiRequestStatus,
  ApiServiceRequest,
  CreateServiceRequestPayload,
} from '@/types/service-request';
import { serviceRequestsService } from '@/services/service-requests.service';
import { apiToTicket } from '@/features/dispatch/mapApi';

const toApiStatus = (s: TicketStatus) => s.toUpperCase() as ApiRequestStatus;

interface RequestsState {
  /** Raw backend rows — used for analytics/dashboard logic (dates, status, etc.). */
  rows: ApiServiceRequest[];
  /** Mapped tickets — used by the board/table/grid and drawer. */
  items: Ticket[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  createManual: (payload: CreateServiceRequestPayload) => Promise<Ticket>;
  updateStatus: (id: string, status: TicketStatus) => Promise<void>;
  assign: (id: string, assigneeName: string) => Promise<void>;
}

function syncFromRows(rows: ApiServiceRequest[]) {
  return { rows, items: rows.map(apiToTicket) };
}

/** Live service-request data fetched from the backend, shared across screens. */
export const useRequestsStore = create<RequestsState>((set, get) => ({
  rows: [],
  items: [],
  loaded: false,
  loading: false,
  error: null,

  fetch: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await serviceRequestsService.list();
      set({ ...syncFromRows(res.data), loaded: true, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Не удалось загрузить заявки' });
    }
  },

  createManual: async (payload) => {
    const row = await serviceRequestsService.create(payload);
    set(syncFromRows([row, ...get().rows]));
    return apiToTicket(row);
  },

  updateStatus: async (id, status) => {
    const row = await serviceRequestsService.updateStatus(id, toApiStatus(status));
    set(syncFromRows(get().rows.map((r) => (r.id === id ? row : r))));
  },

  assign: async (id, assigneeName) => {
    const row = await serviceRequestsService.assign(id, assigneeName);
    set(syncFromRows(get().rows.map((r) => (r.id === id ? row : r))));
  },
}));
