export type Presence = 'ONLINE' | 'AWAY' | 'OFFLINE';

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  presence: Presence;
  activeCount: number;
  doneCount: number;
  rating: number;
  createdAt: string;
}

export interface CreateEmployeePayload {
  name: string;
  role: string;
  phone?: string;
  presence?: Presence;
}
