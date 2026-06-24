import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Api, Bot, MaxError } from '@maxhub/max-bot-api';
import { AppLogger } from '../../../common/logger/app-logger.service';
import type { AppConfig } from '../../../config/configuration';
import { MaxUpdateDto } from '../dto/updates.dto';

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

  async sendMessage(chatId: string, text: string): Promise<void> {
    try {
      await this.api.sendMessageToChat(Number(chatId), text, { format: 'markdown' });
    } catch (error) {
      this.logger.error(
        `MAX send message failed: chatId=${chatId} ${this.describeMaxApiError(error)}`,
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
}
