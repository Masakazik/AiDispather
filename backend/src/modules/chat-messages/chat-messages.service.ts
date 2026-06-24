import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../common/logger/app-logger.service';
import type { AppConfig } from '../../config/configuration';
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
    private readonly config: ConfigService<AppConfig, true>,
    private readonly normalizer: MaxUpdateNormalizer,
    private readonly yandexAiService: YandexAiService,
    @Inject(CRM_ADAPTER) private readonly crmAdapter: CrmAdapterPort,
    private readonly maxApiService: MaxApiService,
    private readonly logger: AppLogger,
  ) {
    this.isDevMode = this.config.get('nodeEnv', { infer: true }) === 'development';
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
    await this.maxApiService.sendMessage(message.chatId, replyText);

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
}
