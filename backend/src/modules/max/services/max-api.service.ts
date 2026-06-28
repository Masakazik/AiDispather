import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Api, Bot, MaxError } from '@maxhub/max-bot-api';
import { AppLogger } from '../../../common/logger/app-logger.service';
import type { AppConfig } from '../../../config/configuration';
import { MaxUpdateDto } from '../dto/updates.dto';

export interface MaxSentMessageResult {
  messageId?: string;
}

@Injectable()
export class MaxApiService {
  private readonly api: Api;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly logger: AppLogger,
  ) {
    const baseUrl = this.config.get('max.apiBaseUrl', { infer: true });
    const token = this.config.get('max.botToken', { infer: true });
    const bot = new Bot(token, { clientOptions: { baseUrl } });
    this.api = bot.api;
  }

  async sendMessage(chatId: string, text: string): Promise<MaxSentMessageResult> {
    const chatNumeric = Number(chatId);
    if (!Number.isFinite(chatNumeric)) {
      throw new Error(`Invalid MAX chat id: ${chatId}`);
    }
    try {
      const response = await this.api.sendMessageToChat(chatNumeric, text, { format: 'markdown' });
      return { messageId: this.extractMessageId(response) };
    } catch (error) {
      this.logger.error(
        `MAX send message failed: chatId=${chatId} ${this.describeMaxApiError(error)}`,
        error instanceof Error ? error.stack : undefined,
        'MaxApi',
      );
      throw error;
    }
  }

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    const chatNumeric = Number(chatId);
    const messageNumeric = Number(messageId);
    if (!Number.isFinite(chatNumeric) || !Number.isFinite(messageNumeric)) {
      throw new Error(`Invalid MAX identifiers: chatId=${chatId} messageId=${messageId}`);
    }
    const api = this.api as unknown as {
      deleteMessage?: (chatId: number, messageId: number) => Promise<unknown>;
    };
    if (typeof api.deleteMessage !== 'function') {
      throw new Error('MAX SDK does not expose deleteMessage');
    }
    try {
      await api.deleteMessage(chatNumeric, messageNumeric);
    } catch (error) {
      this.logger.error(
        `MAX delete message failed: chatId=${chatId} messageId=${messageId} ${this.describeMaxApiError(error)}`,
        error instanceof Error ? error.stack : undefined,
        'MaxApi',
      );
      throw error;
    }
  }

  async getUpdates(
    marker?: number,
    timeoutSec = 25,
  ): Promise<{ updates: MaxUpdateDto[]; marker?: number }> {
    const data = await this.api.getUpdates(['message_created'] as never, {
      ...(typeof marker === 'number' ? { marker } : {}),
      timeout: timeoutSec,
    });

    return { updates: data.updates as unknown as MaxUpdateDto[], marker: data.marker };
  }

  private describeMaxApiError(error: unknown): string {
    if (error instanceof MaxError) {
      return `status=${error.status} code=${error.code ?? 'n/a'} apiMessage=${error.description ?? 'n/a'}`;
    }
    if (error instanceof Error) {
      return `error=${error.message}`;
    }
    return `error=${String(error)}`;
  }

  private extractMessageId(response: unknown): string | undefined {
    if (!response || typeof response !== 'object') return undefined;
    const raw = response as Record<string, unknown>;
    const candidates = [raw.messageId, raw.id, raw.msgId];
    for (const value of candidates) {
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }
    }
    return undefined;
  }
}
