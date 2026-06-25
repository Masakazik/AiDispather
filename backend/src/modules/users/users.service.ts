import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole, type User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

const SALT_ROUNDS = 10;

/** User without sensitive fields, safe to return to clients. */
export type PublicUser = Omit<User, 'passwordHash'>;

export interface CreateAccountInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyId: string | null;
}

export interface UpdateAccountInput {
  name?: string;
  email?: string;
  isActive?: boolean;
  role?: UserRole;
  password?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  // ---- Account management (used by company registration and staff management) ----

  async createAccount(input: CreateAccountInput): Promise<PublicUser> {
    const email = input.email.toLowerCase();
    if (await this.findByEmail(email)) {
      throw new ConflictException('Пользователь с таким логином уже существует');
    }
    const { firstName, lastName } = splitName(input.name);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(input.password, SALT_ROUNDS),
        firstName,
        lastName,
        role: input.role,
        companyId: input.companyId,
      },
    });
    return stripPassword(user);
  }

  async listByCompany(companyId: string): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
    return users.map(stripPassword);
  }

  async updateInCompany(
    id: string,
    dto: UpdateAccountInput,
    companyId: string,
  ): Promise<PublicUser> {
    await this.ensureInCompany(id, companyId);
    const data: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) {
      const { firstName, lastName } = splitName(dto.name);
      data.firstName = firstName;
      data.lastName = lastName;
    }
    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase();
      const existing = await this.findByEmail(email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Пользователь с таким логином уже существует');
      }
      data.email = email;
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.update({ where: { id }, data });
    return stripPassword(user);
  }

  async removeInCompany(id: string, companyId: string): Promise<void> {
    await this.ensureInCompany(id, companyId);
    await this.prisma.user.delete({ where: { id } });
  }

  private async ensureInCompany(id: string, companyId: string): Promise<void> {
    const count = await this.prisma.user.count({ where: { id, companyId } });
    if (count === 0) throw new NotFoundException('User not found');
  }
}

function stripPassword(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

function splitName(name: string): { firstName: string; lastName: string | null } {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') || null };
}
