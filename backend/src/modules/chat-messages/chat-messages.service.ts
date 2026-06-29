import { ChatMessageDirection, type ChatMessage } from '@prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../common/logger/app-logger.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { AiResponse } from '../ai/schemas/ai-response.schema';
import { YandexAiService } from '../ai/yandex-ai.service';
import { CRM_ADAPTER, CrmAdapterPort } from '../bot-integration/crm/crm-adapter.port';
import { MaxUpdateDto } from '../max/dto/updates.dto';
import { MaxApiService } from '../max/services/max-api.service';
import { MaxUpdateNormalizer } from '../max/services/max-update.normalizer';

@Injectable()
export class ChatMessagesService {
  private readonly isDevMode: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly normalizer: MaxUpdateNormalizer,
    private readonly yandexAiService: YandexAiService,
    @Inject(CRM_ADAPTER) private readonly crmAdapter: CrmAdapterPort,
    private readonly maxApiService: MaxApiService,
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly logger: AppLogger,
  ) {
    this.isDevMode = this.configService.get<string>('NODE_ENV', 'production') === 'development';
  }

  async listThreads(companyId: string): Promise<ChatThreadDto[]> {
    const rows = await this.prisma.chatMessage.findMany({
      where: { companyId, deletedAt: null },
      include: { building: true },
      orderBy: { createdAt: 'asc' },
      take: 3000,
    });
    if (rows.length === 0) return [];

    const uniqueChatIds = Array.from(new Set(rows.map((r) => r.externalChatId)));
    const requestMappings = await this.prisma.serviceRequest.findMany({
      where: {
        companyId,
        externalChatId: { in: uniqueChatIds },
      },
      select: {
        externalChatId: true,
        buildingId: true,
        apartmentLabel: true,
        building: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const mappingByChat = new Map<
      string,
      { buildingId: string | null; buildingName: string; fallbackLabel: string }
    >();
    for (const row of requestMappings) {
      const chatId = row.externalChatId?.trim();
      if (!chatId || mappingByChat.has(chatId)) continue;
      mappingByChat.set(chatId, {
        buildingId: row.buildingId ?? null,
        buildingName: row.building?.name?.trim() || '',
        fallbackLabel: row.apartmentLabel?.trim() || '',
      });
    }

    const threads = new Map<string, ChatThreadDto>();
    for (const row of rows) {
      const mapping = mappingByChat.get(row.externalChatId);
      const buildingId = row.buildingId ?? mapping?.buildingId ?? null;
      const buildingName =
        row.building?.name?.trim() ||
        mapping?.buildingName ||
        mapping?.fallbackLabel ||
        'Дом не указан';

      const message: ChatMessageDto = {
        id: row.id,
        chatId: row.externalChatId,
        messageId: row.externalMessageId,
        buildingId,
        buildingName,
        author: row.authorName?.trim() || (row.direction === ChatMessageDirection.INCOMING ? 'Житель' : 'Диспетчер'),
        text: row.text,
        createdAt: row.createdAt.toISOString(),
        incoming: row.direction === ChatMessageDirection.INCOMING,
      };

      const existing = threads.get(row.externalChatId);
      if (!existing) {
        threads.set(row.externalChatId, {
          id: row.externalChatId,
          chatId: row.externalChatId,
          chatLabel: `Чат ${row.externalChatId}`,
          routable: /^\d+$/.test(row.externalChatId),
          buildingId,
          buildingName,
          unread: message.incoming ? 1 : 0,
          lastAt: message.createdAt,
          messages: [message],
        });
      } else {
        existing.messages.push(message);
        existing.lastAt = message.createdAt;
        if (message.incoming) existing.unread += 1;
        if ((!existing.buildingId || existing.buildingName === 'Дом не указан') && buildingName !== 'Дом не указан') {
          existing.buildingId = buildingId;
          existing.buildingName = buildingName;
        }
      }
    }

    return Array.from(threads.values()).sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    );
  }

  async recordOutgoingMessage(params: {
    companyId: string | null;
    chatId: string;
    text: string;
    authorName?: string;
    externalMessageId?: string;
    externalUserId?: string;
  }): Promise<ChatMessage> {
    const companyId = params.companyId ?? (await this.resolveDefaultCompanyId());
    const buildingId = companyId ? await this.resolveBuildingIdForChat(companyId, params.chatId) : null;
    const row = await this.prisma.chatMessage.create({
      data: {
        companyId,
        buildingId,
        externalChatId: params.chatId,
        externalMessageId: params.externalMessageId,
        externalUserId: params.externalUserId,
        authorName: params.authorName ?? 'Диспетчер',
        text: params.text,
        direction: ChatMessageDirection.OUTGOING,
      },
    });
    this.realtime.emitChatsUpdated(companyId ?? null);
    return row;
  }

  async markDeletedByExternalMessageId(
    companyId: string | null,
    chatId: string,
    messageId: string,
  ): Promise<void> {
    const result = await this.prisma.chatMessage.updateMany({
      where: {
        companyId: companyId ?? undefined,
        externalChatId: chatId,
        externalMessageId: messageId,
      },
      data: { deletedAt: new Date() },
    });
    if (result.count > 0) {
      this.realtime.emitChatsUpdated(companyId ?? null);
    }
  }

  async handleUpdate(rawUpdate: MaxUpdateDto | Record<string, unknown>): Promise<void> {
    const normalized = this.normalizer.normalize(rawUpdate);
    if (!normalized.ok) {
      this.logger.log(
        JSON.stringify({
          event: 'update_skipped',
          reason: normalized.reason,
          updateType: normalized.updateType,
          chatType: normalized.chatType,
          chatId: normalized.chatId,
        }),
        'ChatMessages',
      );
      return;
    }

    const message = normalized.message;

    if (!this.normalizer.isGroupChat(message)) {
      this.logger.log(
        JSON.stringify({
          event: 'skip_private_chat',
          chatId: message.chatId,
          chatType: message.chatType,
        }),
        'ChatMessages',
      );
      return;
    }

    if (message.isBotMessage) {
      this.logger.debug(
        JSON.stringify({
          event: 'skip_bot_message',
          chatId: message.chatId,
          messageId: message.messageId,
        }),
        'ChatMessages',
      );
      return;
    }

    const incoming = await this.recordIncomingMessage(message);
    if (incoming.duplicate) {
      this.logger.debug(
        JSON.stringify({
          event: 'skip_duplicate_message',
          chatId: message.chatId,
          messageId: message.messageId,
        }),
        'ChatMessages',
      );
      return;
    }

    this.logger.log(
      JSON.stringify({
        event: 'group_message_received',
        chatId: message.chatId,
        messageId: message.messageId,
        userId: message.userId,
      }),
      'ChatMessages',
    );

    const analysis = await this.yandexAiService.analyzeMessage(message.text);

    if (this.isDevMode) {
      await this.maxApiService.sendMessage(message.chatId, this.formatAiDebugMessage(analysis));
    }

    if (!analysis.is_problem) {
      this.logger.debug(
        JSON.stringify({
          event: 'ai_not_a_problem',
          chatId: message.chatId,
          messageId: message.messageId,
        }),
        'ChatMessages',
      );
      return;
    }

    const ticket = await this.crmAdapter.createProblemTicket({
      category: analysis.category,
      priority: analysis.priority,
      summary: analysis.summary,
      originalMessage: message.text,
      chatId: message.chatId,
      messageId: message.messageId,
      userId: message.userId,
      username: message.username,
    });

    const replyText = `${analysis.user_message}\n\nНомер заявки: ${ticket.ticketId}`;
    const sent = await this.maxApiService.sendMessage(message.chatId, replyText);
    await this.recordOutgoingMessage({
      companyId: incoming.companyId,
      chatId: message.chatId,
      text: replyText,
      authorName: 'Бот ДомДиспетчер',
      externalMessageId: sent.messageId,
    });

    this.logger.log(
      JSON.stringify({
        event: 'problem_ticket_handled',
        chatId: message.chatId,
        messageId: message.messageId,
        ticketId: ticket.ticketId,
        category: analysis.category,
        priority: analysis.priority,
      }),
      'ChatMessages',
    );
  }

  private formatAiDebugMessage(analysis: AiResponse): string {
    const json = JSON.stringify(analysis, null, 2);
    return `🛠 **DEV: ответ AI**\n\`\`\`json\n${json}\n\`\`\``;
  }

  private async recordIncomingMessage(message: {
    chatId: string;
    messageId?: string;
    userId?: string;
    username?: string;
    text: string;
  }): Promise<{ duplicate: boolean; companyId: string | null }> {
    if (message.messageId) {
      const existing = await this.prisma.chatMessage.findUnique({
        where: {
          externalChatId_externalMessageId: {
            externalChatId: message.chatId,
            externalMessageId: message.messageId,
          },
        },
        select: { id: true, companyId: true },
      });
      if (existing) {
        return { duplicate: true, companyId: existing.companyId };
      }
    }

    const companyId = await this.resolveDefaultCompanyId();
    const buildingId = companyId ? await this.resolveBuildingIdForChat(companyId, message.chatId) : null;
    await this.prisma.chatMessage.create({
      data: {
        companyId,
        buildingId,
        externalChatId: message.chatId,
        externalMessageId: message.messageId,
        externalUserId: message.userId,
        authorName: message.username?.trim() || 'Житель',
        text: message.text,
        direction: ChatMessageDirection.INCOMING,
      },
    });
    this.realtime.emitChatsUpdated(companyId);
    return { duplicate: false, companyId };
  }

  private async resolveDefaultCompanyId(): Promise<string | null> {
    const company = await this.prisma.company.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return company?.id ?? null;
  }

  private async resolveBuildingIdForChat(companyId: string, chatId: string): Promise<string | null> {
    const request = await this.prisma.serviceRequest.findFirst({
      where: { companyId, externalChatId: chatId, buildingId: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { buildingId: true },
    });
    return request?.buildingId ?? null;
  }
}

export interface ChatMessageDto {
  id: string;
  chatId: string;
  messageId: string | null;
  buildingId: string | null;
  buildingName: string;
  author: string;
  text: string;
  createdAt: string;
  incoming: boolean;
}

export interface ChatThreadDto {
  id: string;
  chatId: string;
  chatLabel: string;
  routable: boolean;
  buildingId: string | null;
  buildingName: string;
  unread: number;
  lastAt: string;
  messages: ChatMessageDto[];
}
