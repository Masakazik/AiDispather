import { Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({
      orderBy: [{ done: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  create(dto: CreateTaskDto, createdById?: string): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        assigneeName: dto.assigneeName,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        priority: dto.priority,
        createdById,
      },
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    await this.ensureExists(id);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.assigneeName !== undefined ? { assigneeName: dto.assigneeName } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.done !== undefined ? { done: dto.done } : {}),
        ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null } : {}),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.task.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const count = await this.prisma.task.count({ where: { id } });
    if (count === 0) throw new NotFoundException('Task not found');
  }
}
