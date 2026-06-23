import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import type { Prisma, ServiceRequest } from '@prisma/client';
import { RequestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import {
  NOTIFICATIONS_QUEUE,
  type NotificationJobData,
} from '../../queue/queue.constants';
import type { AppConfig } from '../../config/configuration';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { QueryServiceRequestDto } from './dto/query-service-request.dto';

const CACHE_PREFIX = 'service-request:';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ServiceRequestsService {
  private readonly cacheTtl: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    config: ConfigService<AppConfig, true>,
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly notifications: Queue<NotificationJobData>,
  ) {
    this.cacheTtl = config.get('cacheTtl', { infer: true });
  }

  async findAll(query: QueryServiceRequestDto): Promise<PaginatedResult<ServiceRequest>> {
    const where: Prisma.ServiceRequestWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);
    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  findOne(id: string): Promise<ServiceRequest> {
    return this.redis.remember(`${CACHE_PREFIX}${id}`, this.cacheTtl, async () => {
      const request = await this.prisma.serviceRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException('Service request not found');
      return request;
    });
  }

  async create(dto: CreateServiceRequestDto, createdById?: string): Promise<ServiceRequest> {
    const request = await this.prisma.serviceRequest.create({
      data: { ...dto, createdById },
    });
    await this.notifications.add('request-created', {
      type: 'REQUEST_CREATED',
      requestId: request.id,
      message: `New request: ${request.title}`,
    });
    return request;
  }

  async update(id: string, dto: UpdateServiceRequestDto): Promise<ServiceRequest> {
    await this.ensureExists(id);
    const completedAt = dto.status === RequestStatus.DONE ? new Date() : undefined;
    const request = await this.prisma.serviceRequest.update({
      where: { id },
      data: { ...dto, ...(completedAt ? { completedAt } : {}) },
    });
    await this.redis.del(`${CACHE_PREFIX}${id}`);
    if (dto.status) {
      await this.notifications.add('request-status-changed', {
        type: 'REQUEST_STATUS_CHANGED',
        requestId: id,
        message: `Status changed to ${dto.status}`,
      });
    }
    return request;
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.serviceRequest.delete({ where: { id } });
    await this.redis.del(`${CACHE_PREFIX}${id}`);
  }

  private async ensureExists(id: string): Promise<void> {
    const count = await this.prisma.serviceRequest.count({ where: { id } });
    if (count === 0) throw new NotFoundException('Service request not found');
  }
}
