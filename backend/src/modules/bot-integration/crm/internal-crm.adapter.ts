import { Injectable } from '@nestjs/common';
import { AppLogger } from '../../../common/logger/app-logger.service';
import { IntegrationsService } from '../../integrations/integrations.service';
import {
  CrmAdapterPort,
  CrmProblemTicketPayload,
  CrmProblemTicketResult,
} from './crm-adapter.port';
import { buildMaxWebhookDto, extractTicketIdFromLeadResult } from './crm-mapping';

/** In-process CRM adapter — calls IntegrationsService directly (no HTTP hop). */
@Injectable()
export class InternalCrmAdapter implements CrmAdapterPort {
  constructor(
    private readonly integrations: IntegrationsService,
    private readonly logger: AppLogger,
  ) {}

  async createProblemTicket(payload: CrmProblemTicketPayload): Promise<CrmProblemTicketResult> {
    const result = await this.integrations.handleMaxWebhook(buildMaxWebhookDto(payload));
    const ticketId = extractTicketIdFromLeadResult(result);

    if (!ticketId) {
      throw new Error('CRM response does not contain ticket id');
    }

    this.logger.log(
      JSON.stringify({
        event: 'crm_problem_ticket_created',
        ticketId,
        created: result.created,
        reason: result.reason,
        category: payload.category,
        priority: payload.priority,
        chatId: payload.chatId,
      }),
      'InternalCrmAdapter',
    );

    return { ticketId };
  }
}
