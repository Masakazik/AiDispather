import { Module, forwardRef } from '@nestjs/common';
import { ChatMessagesModule } from '../chat-messages/chat-messages.module';
import { MaxBotWebhookController } from './controllers/max-webhook.controller';
import { MaxApiService } from './services/max-api.service';
import { MaxPollingService } from './services/max-polling.service';
import { MaxUpdateNormalizer } from './services/max-update.normalizer';

@Module({
  imports: [forwardRef(() => ChatMessagesModule)],
  controllers: [MaxBotWebhookController],
  providers: [MaxApiService, MaxPollingService, MaxUpdateNormalizer],
  exports: [MaxApiService, MaxUpdateNormalizer],
})
export class MaxModule {}
