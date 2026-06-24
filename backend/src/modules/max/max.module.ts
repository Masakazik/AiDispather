import { Module, forwardRef } from '@nestjs/common';
import { ChatMessagesModule } from '../chat-messages/chat-messages.module';
import { MaxInboundWebhookController } from './controllers/max-inbound-webhook.controller';
import { MaxApiService } from './services/max-api.service';
import { MaxPollingService } from './services/max-polling.service';
import { MaxUpdateNormalizer } from './services/max-update.normalizer';

@Module({
  imports: [forwardRef(() => ChatMessagesModule)],
  controllers: [MaxInboundWebhookController],
  providers: [MaxApiService, MaxPollingService, MaxUpdateNormalizer],
  exports: [MaxApiService, MaxUpdateNormalizer],
})
export class MaxModule {}
