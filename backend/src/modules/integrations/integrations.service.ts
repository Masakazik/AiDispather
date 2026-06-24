import { Injectable, Logger } from '@nestjs/common';
import { RequestPriority, RequestSource } from '@prisma/client';
import { ServiceRequestsService } from '../service-requests/service-requests.service';
import { MaxWebhookDto } from './dto/max-webhook.dto';

const PRIORITY_MAP: Record<string, RequestPriority> = {
  low: RequestPriority.LOW,
  medium: RequestPriority.MEDIUM,
  high: RequestPriority.HIGH,
  critical: RequestPriority.CRITICAL,
  urgent: RequestPriority.CRITICAL,
};

export interface LeadResult {
  created: boolean;
  id?: string;
  number?: number;
  num?: string;
  message?: string;
  reason?: string;
}

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private readonly serviceRequests: ServiceRequestsService) {}

  /** Turn a MAX bot message into a service request (or skip non-problems). */
  async handleMaxWebhook(dto: MaxWebhookDto): Promise<LeadResult> {
    if (!dto.is_problem) {
      return { created: false, reason: 'not_a_problem' };
    }

    // De-duplicate repeated messages from the same conversation.
    if (dto.external_chat_id) {
      const existing = await this.serviceRequests.findOpenByExternalChatId(dto.external_chat_id);
      if (existing) {
        this.logger.log(`MAX lead de-duplicated to existing #${existing.number}`);
        return {
          created: false,
          reason: 'duplicate',
          id: existing.id,
          number: existing.number,
          num: `#${existing.number}`,
          message: dto.user_message,
        };
      }
    }

    const summary = dto.summary?.trim() || 'Обращение из MAX';
    const priority = PRIORITY_MAP[dto.priority?.toLowerCase() ?? ''] ?? RequestPriority.MEDIUM;

    const request = await this.serviceRequests.create({
      title: summary.slice(0, 200),
      description: summary,
      priority,
      source: RequestSource.MAX,
      category: dto.category,
      residentName: dto.resident_name,
      residentPhone: dto.phone,
      apartmentLabel: dto.address,
      externalChatId: dto.external_chat_id,
    });

    this.logger.log(`MAX lead created: #${request.number} (${request.category ?? 'без категории'})`);
    return {
      created: true,
      id: request.id,
      number: request.number,
      num: `#${request.number}`,
      message: dto.user_message,
    };
  }
}
