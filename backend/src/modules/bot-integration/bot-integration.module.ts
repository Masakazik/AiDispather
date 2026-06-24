import { Global, Module } from '@nestjs/common';
import { IntegrationsModule } from '../integrations/integrations.module';
import { CRM_ADAPTER } from './crm/crm-adapter.port';
import { InternalCrmAdapter } from './crm/internal-crm.adapter';

@Global()
@Module({
  imports: [IntegrationsModule],
  providers: [
    InternalCrmAdapter,
    {
      provide: CRM_ADAPTER,
      useExisting: InternalCrmAdapter,
    },
  ],
  exports: [CRM_ADAPTER],
})
export class BotIntegrationModule {}
