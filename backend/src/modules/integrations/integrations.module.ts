import { Module } from '@nestjs/common';
import { ServiceRequestsModule } from '../service-requests/service-requests.module';
import { IntegrationsService } from './integrations.service';
import { MaxWebhookController } from './max-webhook.controller';

@Module({
  imports: [ServiceRequestsModule],
  controllers: [MaxWebhookController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
