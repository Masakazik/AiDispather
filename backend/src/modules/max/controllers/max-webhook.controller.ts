import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { AppLogger } from '../../../common/logger/app-logger.service';
import { ChatMessagesService } from '../../chat-messages/chat-messages.service';
import { MaxUpdateDto } from '../dto/updates.dto';

/** MAX inbound webhook — same as poverka-max-ai-bot: POST /webhooks/max */
@Public()
@Controller('webhooks/max')
export class MaxBotWebhookController {
  constructor(
    private readonly chatMessagesService: ChatMessagesService,
    private readonly logger: AppLogger,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Req() req: Request): Promise<{ ok: boolean }> {
    const body = req.body as unknown;
    const updates = this.extractUpdates(body);
    this.logger.log(
      JSON.stringify({
        event: 'webhook_received',
        updatesCount: updates.length,
        firstUpdateType: this.readUpdateType(updates[0]),
      }),
      'MaxWebhook',
    );

    for (const update of updates) {
      await this.chatMessagesService.handleUpdate(update);
    }

    return { ok: true };
  }

  private readUpdateType(
    update: MaxUpdateDto | Record<string, unknown> | undefined,
  ): string | undefined {
    if (!update || typeof update !== 'object') {
      return undefined;
    }
    const raw = update as Record<string, unknown>;
    const value = raw.update_type ?? raw.updateType ?? raw.type;
    return typeof value === 'string' ? value : undefined;
  }

  private extractUpdates(body: unknown): Array<MaxUpdateDto | Record<string, unknown>> {
    if (!body || typeof body !== 'object') {
      return [];
    }

    if (Array.isArray(body)) {
      return body as Array<MaxUpdateDto | Record<string, unknown>>;
    }

    const candidate = body as Record<string, unknown>;
    if (Array.isArray(candidate.updates)) {
      return candidate.updates as Array<MaxUpdateDto | Record<string, unknown>>;
    }

    return [candidate];
  }
}
