import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { WebhookSecretGuard } from '../../common/guards/webhook-secret.guard';
import { IntegrationsService } from './integrations.service';
import { MaxWebhookDto } from './dto/max-webhook.dto';

@Controller('integrations/max')
export class MaxWebhookController {
  constructor(private readonly integrations: IntegrationsService) {}

  /**
   * Inbound webhook for the MAX messenger chat-bot.
   * Public to JWT, protected by the shared `x-webhook-secret` header.
   */
  @Public()
  @UseGuards(WebhookSecretGuard)
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(@Body() dto: MaxWebhookDto) {
    return this.integrations.handleMaxWebhook(dto);
  }
}
