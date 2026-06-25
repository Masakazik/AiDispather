import type { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  companyId: string | null;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string | null;
}
