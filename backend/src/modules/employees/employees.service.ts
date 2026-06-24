import { Injectable, NotFoundException } from '@nestjs/common';
import type { Employee } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Employee[]> {
    return this.prisma.employee.findMany({ orderBy: { createdAt: 'asc' } });
  }

  create(dto: CreateEmployeeDto): Promise<Employee> {
    return this.prisma.employee.create({ data: dto });
  }

  async remove(id: string): Promise<void> {
    const count = await this.prisma.employee.count({ where: { id } });
    if (count === 0) throw new NotFoundException('Employee not found');
    await this.prisma.employee.delete({ where: { id } });
  }
}
