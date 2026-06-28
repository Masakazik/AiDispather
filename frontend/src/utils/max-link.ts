import { config } from '@/constants/config';

export function buildMaxMessageLink(
  chatId: string | null | undefined,
  messageId: string | null | undefined,
): string | null {
  if (!chatId || !messageId) return null;
  const c = chatId.trim();
  const m = messageId.trim();
  if (!c || !m) return null;
  return config.maxMessageUrlTemplate
    .replaceAll('{chatId}', encodeURIComponent(c))
    .replaceAll('{messageId}', encodeURIComponent(m));
}
