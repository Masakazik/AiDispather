import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

export interface CompanyListItem {
  id: string;
  name: string;
  inn: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  adminName: string | null;
  adminEmail: string | null;
  usersCount: number;
  requestsCount: number;
}

const includeShape = {
  _count: { select: { users: true, requests: true } },
  users: {
    where: { role: UserRole.ADMIN },
    select: { firstName: true, lastName: true, email: true },
    orderBy: { createdAt: 'asc' as const },
    take: 1,
  },
};

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async findAll(): Promise<CompanyListItem[]> {
    const companies = await this.prisma.company.findMany({
      include: includeShape,
      orderBy: { createdAt: 'desc' },
    });
    return companies.map(shape);
  }

  async findOne(id: string): Promise<CompanyListItem> {
    const company = await this.prisma.company.findUnique({ where: { id }, include: includeShape });
    if (!company) throw new NotFoundException('Компания не найдена');
    return shape(company);
  }

  async create(dto: CreateCompanyDto): Promise<CompanyListItem> {
    const adminEmail = dto.adminEmail.toLowerCase();
    if (await this.users.findByEmail(adminEmail)) {
      throw new ConflictException('Пользователь с таким логином администратора уже существует');
    }
    const company = await this.prisma.company.create({
      data: { name: dto.name, inn: dto.inn, address: dto.address, phone: dto.phone },
    });
    await this.users.createAccount({
      name: dto.adminName,
      email: adminEmail,
      password: dto.adminPassword,
      role: UserRole.ADMIN,
      companyId: company.id,
    });
    return this.findOne(company.id);
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<CompanyListItem> {
    await this.ensureExists(id);
    const { adminName, adminEmail, ...companyData } = dto;

    if (Object.keys(companyData).length > 0) {
      await this.prisma.company.update({ where: { id }, data: companyData });
    }

    if (adminName !== undefined || adminEmail !== undefined) {
      const admin = await this.prisma.user.findFirst({
        where: { companyId: id, role: UserRole.ADMIN },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!admin) {
        throw new NotFoundException('Администратор компании не найден');
      }
      await this.users.updateInCompany(
        admin.id,
        {
          name: adminName,
          email: adminEmail,
        },
        id,
      );
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.company.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const count = await this.prisma.company.count({ where: { id } });
    if (count === 0) throw new NotFoundException('Компания не найдена');
  }
}

function shape(company: {
  id: string;
  name: string;
  inn: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  _count: { users: number; requests: number };
  users: { firstName: string | null; lastName: string | null; email: string }[];
}): CompanyListItem {
  const admin = company.users[0];
  const adminName = admin
    ? [admin.firstName, admin.lastName].filter(Boolean).join(' ') || null
    : null;
  return {
    id: company.id,
    name: company.name,
    inn: company.inn,
    address: company.address,
    phone: company.phone,
    isActive: company.isActive,
    createdAt: company.createdAt,
    adminName,
    adminEmail: admin?.email ?? null,
    usersCount: company._count.users,
    requestsCount: company._count.requests,
  };
}
