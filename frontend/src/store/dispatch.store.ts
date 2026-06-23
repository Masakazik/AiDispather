import { create } from 'zustand';
import type { TicketPriority, TicketStatus } from '@/types/dispatch';

export type RequestsView = 'kanban' | 'table' | 'grid';

interface DispatchState {
  // Requests filters
  search: string;
  priority: TicketPriority | 'all';
  statusFilter: TicketStatus | 'all';
  buildingFilter: string;
  assigneeFilter: string;
  view: RequestsView;

  // Drawers
  openTicketId: string | null;
  openResidentId: string | null;

  setSearch: (v: string) => void;
  setPriority: (v: TicketPriority | 'all') => void;
  setStatusFilter: (v: TicketStatus | 'all') => void;
  setBuildingFilter: (v: string) => void;
  setAssigneeFilter: (v: string) => void;
  setView: (v: RequestsView) => void;

  openTicket: (id: string) => void;
  closeTicket: () => void;
  openResident: (id: string) => void;
  closeResident: () => void;
}

export const useDispatchStore = create<DispatchState>((set) => ({
  search: '',
  priority: 'all',
  statusFilter: 'all',
  buildingFilter: 'all',
  assigneeFilter: 'all',
  view: 'kanban',

  openTicketId: null,
  openResidentId: null,

  setSearch: (search) => set({ search }),
  setPriority: (priority) => set({ priority }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setBuildingFilter: (buildingFilter) => set({ buildingFilter }),
  setAssigneeFilter: (assigneeFilter) => set({ assigneeFilter }),
  setView: (view) => set({ view }),

  openTicket: (id) => set({ openTicketId: id }),
  closeTicket: () => set({ openTicketId: null }),
  openResident: (id) => set({ openResidentId: id }),
  closeResident: () => set({ openResidentId: null }),
}));
