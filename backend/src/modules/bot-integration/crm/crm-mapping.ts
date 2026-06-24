import type { MaxWebhookDto } from '../../integrations/dto/max-webhook.dto';
import type { LeadResult } from '../../integrations/integrations.service';
import type { CrmProblemTicketPayload } from './crm-adapter.port';

export function buildMaxWebhookDto(payload: CrmProblemTicketPayload): MaxWebhookDto {
  const dto: MaxWebhookDto = {
    is_problem: true,
    category: payload.category,
    priority: payload.priority,
    summary: payload.summary,
    user_message: payload.originalMessage,
    external_chat_id: payload.chatId,
    external_user_id: payload.userId,
  };

  if (payload.username?.trim()) {
    dto.resident_name = payload.username.trim();
  }

  return dto;
}

export function extractTicketIdFromLeadResult(data: LeadResult): string | null {
  const candidates = [data.num, data.number, data.id];
  for (const candidate of candidates) {
    const normalized = String(candidate ?? '').trim();
    if (normalized) {
      return normalized;
    }
  }
  return null;
}
