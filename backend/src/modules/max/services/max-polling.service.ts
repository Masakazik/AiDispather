import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../../common/logger/app-logger.service';
import type { AppConfig } from '../../../config/configuration';
import { ChatMessagesService } from '../../chat-messages/chat-messages.service';
import { MaxApiService } from './max-api.service';

@Injectable()
export class MaxPollingService implements OnModuleInit, OnModuleDestroy {
  private running = false;
  private marker?: number;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly maxApiService: MaxApiService,
    private readonly chatMessagesService: ChatMessagesService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit(): void {
    const mode = this.config.get('max.mode', { infer: true });
    if (mode !== 'long_polling') {
      return;
    }

    this.running = true;
    this.logger.log('MAX long polling mode enabled', 'MaxPolling');
    void this.pollLoop();
  }

  onModuleDestroy(): void {
    this.running = false;
  }

  private async pollLoop(): Promise<void> {
    const timeoutSec = this.config.get('max.longPollingTimeoutSec', { infer: true });

    while (this.running) {
      try {
        const { updates, marker } = await this.maxApiService.getUpdates(this.marker, timeoutSec);
        if (marker) {
          this.marker = marker;
        }

        for (const update of updates) {
          try {
            await this.chatMessagesService.handleUpdate(update);
          } catch (error) {
            const stack = error instanceof Error ? error.stack : undefined;
            this.logger.error('Failed to process update from long polling', stack, 'MaxPolling');
          }
        }
      } catch (error) {
        const stack = error instanceof Error ? error.stack : undefined;
        this.logger.error('Long polling request failed', stack, 'MaxPolling');
        await this.sleep(2000);
      }
    }
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
