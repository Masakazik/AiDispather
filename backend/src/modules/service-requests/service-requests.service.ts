import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import {
  NOTIFICATIONS_QUEUE,
  type NotificationJobData,
} from '../../queue/queue.constants';
import type { AppConfig } from '../../config/configuration';
import { RealtimeService } from '../../realtime/realtime.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { QueryServiceRequestDto } from './dto/query-service-request.dto';

const CACHE_PREFIX = 'service-request:';
const NUMBER_SEQUENCE = 'hd_request_number_seq';
const NUMBER_START = 10259;

/** Service request including its building, as returned to clients. */
export type ServiceRequestWithRelations = Prisma.ServiceRequestGetPayload<{
  include: { building: true };
}>;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const includeRelations = { building: true } satisfies Prisma.ServiceRequestInclude;

@Injectable()
export class ServiceRequestsService implements OnModuleInit {
  private readonly cacheTtl: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly realtime: RealtimeService,
    config: ConfigService<AppConfig, true>,
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly notifications: Queue<NotificationJobData>,
  ) {
    this.cacheTtl = config.get('cacheTtl', { infer: true });
  }

  /** Ensure the human-friendly ticket-number sequence exists before serving traffic. */
  async onModuleInit(): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `CREATE SEQUENCE IF NOT EXISTS ${NUMBER_SEQUENCE} START WITH ${NUMBER_START} MINVALUE ${NUMBER_START}`,
    );
  }

  private async nextNumber(): Promise<number> {
    const rows = await this.prisma.$queryRawUnsafe<{ nextval: bigint }[]>(
      `SELECT nextval('${NUMBER_SEQUENCE}') AS nextval`,
    );
    return Number(rows[0].nextval);
  }

  /** First active company — used to attribute leads created by the MAX bot. */
  async resolveDefaultCompanyId(): Promise<string | null> {
    const company = await this.prisma.company.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return company?.id ?? null;
  }

  async findAll(
    query: QueryServiceRequestDto,
    companyId: string | null,
  ): Promise<PaginatedResult<ServiceRequestWithRelations>> {
    const where: Prisma.ServiceRequestWhereInput = {
      companyId: companyId ?? undefined,
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: includeRelations,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);
    return { data, total, page: query.page, pageSize: query.pageSize };
  }

  findOne(id: string): Promise<ServiceRequestWithRelations> {
    return this.redis.remember(`${CACHE_PREFIX}${id}`, this.cacheTtl, async () => {
      const request = await this.prisma.serviceRequest.findUnique({
        where: { id },
        include: includeRelations,
      });
      if (!request) throw new NotFoundException('Service request not found');
      return request;
    });
  }

  /** Find a still-open lead from the same MAX chat + user, for de-duplication. */
  findOpenByExternalMessengerIdentity(
    externalChatId: string,
    externalUserId: string,
  ): Promise<ServiceRequestWithRelations | null> {
    return this.prisma.serviceRequest.findFirst({
      where: {
        externalChatId,
        externalUserId,
        status: { notIn: [RequestStatus.DONE, RequestStatus.CLOSED] },
      },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    dto: CreateServiceRequestDto,
    opts: { createdById?: string; companyId?: string | null } = {},
  ): Promise<ServiceRequestWithRelations> {
    const number = await this.nextNumber();
    const request = await this.prisma.serviceRequest.create({
      data: { ...dto, number, createdById: opts.createdById, companyId: opts.companyId ?? null },
      include: includeRelations,
    });
    await this.notifications.add('request-created', {
      type: 'REQUEST_CREATED',
      requestId: request.id,
      message: `New request #${request.number}: ${request.title}`,
    });
    this.realtime.emitRequestsUpdated(request.companyId ?? null);
    return request;
  }

  async update(
    id: string,
    dto: UpdateServiceRequestDto,
    companyId: string | null,
  ): Promise<ServiceRequestWithRelations> {
    await this.ensureExists(id, companyId);
    const completedAt = dto.status === RequestStatus.DONE ? new Date() : undefined;
    const request = await this.prisma.serviceRequest.update({
      where: { id },
      data: { ...dto, ...(completedAt ? { completedAt } : {}) },
      include: includeRelations,
    });
    await this.redis.del(`${CACHE_PREFIX}${id}`);
    if (dto.status) {
      await this.notifications.add('request-status-changed', {
        type: 'REQUEST_STATUS_CHANGED',
        requestId: id,
        message: `Status changed to ${dto.status}`,
      });
    }
    this.realtime.emitRequestsUpdated(request.companyId ?? null);
    return request;
  }

  async remove(id: string, companyId: string | null): Promise<void> {
    const existing = await this.ensureExists(id, companyId);
    await this.prisma.serviceRequest.delete({ where: { id } });
    await this.redis.del(`${CACHE_PREFIX}${id}`);
    this.realtime.emitRequestsUpdated(existing.companyId ?? null);
  }

  private async ensureExists(
    id: string,
    companyId: string | null,
  ): Promise<{ id: string; companyId: string | null }> {
    const existing = await this.prisma.serviceRequest.findFirst({
      where: { id, companyId: companyId ?? undefined },
      select: { id: true, companyId: true },
    });
    if (!existing) throw new NotFoundException('Service request not found');
    return existing;
  }
}
