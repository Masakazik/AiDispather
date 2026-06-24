export interface CrmProblemTicketPayload {
  category: string;
  priority: string;
  summary: string;
  originalMessage: string;
  chatId: string;
  messageId?: string;
  userId?: string;
  username?: string;
}

export interface CrmProblemTicketResult {
  ticketId: string;
}

export interface CrmAdapterPort {
  createProblemTicket(payload: CrmProblemTicketPayload): Promise<CrmProblemTicketResult>;
}

export const CRM_ADAPTER = 'CRM_ADAPTER';
