import { buildMaxWebhookDto, extractTicketIdFromLeadResult } from './crm-mapping';

describe('crm-mapping', () => {
  const payload = {
    category: 'шум',
    priority: 'medium',
    summary: 'Жалоба на шум',
    originalMessage: 'У нас шум по ночам',
    chatId: '304896997',
    messageId: 'mid-1',
    userId: 'user-1',
    username: 'ivan',
  };

  it('builds MaxWebhookDto without extra fields', () => {
    expect(buildMaxWebhookDto(payload)).toEqual({
      is_problem: true,
      category: 'шум',
      priority: 'medium',
      summary: 'Жалоба на шум',
      user_message: 'У нас шум по ночам',
      external_chat_id: '304896997',
      external_user_id: 'user-1',
      resident_name: 'ivan',
    });
  });

  it('extracts ticket id preferring num', () => {
    expect(
      extractTicketIdFromLeadResult({
        created: true,
        id: 'uuid-1',
        number: 123,
        num: '#123',
      }),
    ).toBe('#123');
  });
});
