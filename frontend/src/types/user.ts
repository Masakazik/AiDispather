export type UserRole = 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'RESIDENT';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
