import { Injectable } from '@nestjs/common';
import { AppLogger } from '../../../common/logger/app-logger.service';
import { MaxUpdateDto, NormalizedChatMessage } from '../dto/updates.dto';

const PRIVATE_CHAT_TYPES = new Set(['dialog', 'private']);

export type NormalizeResult =
  | { ok: true; message: NormalizedChatMessage }
  | { ok: false; reason: string; updateType?: string; chatType?: string; chatId?: string };

@Injectable()
export class MaxUpdateNormalizer {
  constructor(private readonly logger: AppLogger) {}

  normalize(rawUpdate: MaxUpdateDto | Record<string, unknown>): NormalizeResult {
    const raw = rawUpdate as Record<string, unknown>;
    const message = (raw.message ?? {}) as Record<string, unknown>;
    const sender = (message.sender ?? {}) as Record<string, unknown>;
    const recipient = (message.recipient ?? {}) as Record<string, unknown>;
    const body = (message.body ?? {}) as Record<string, unknown>;

    const updateType = this.readString(
      raw.update_type ?? raw.updateType ?? raw.type ?? message.type,
    );
    if (!updateType) {
      return { ok: false, reason: 'missing_update_type' };
    }

    const mappedType = updateType === 'message_created' ? 'message_new' : updateType;
    if (mappedType !== 'message_new') {
      return { ok: false, reason: 'unsupported_update_type', updateType };
    }

    const chatId = this.readString(
      recipient.chat_id ??
        recipient.chatId ??
        raw.chat_id ??
        raw.chatId ??
        (raw.chat as Record<string, unknown> | undefined)?.chat_id ??
        (raw.chat as Record<string, unknown> | undefined)?.chatId,
    );
    if (!chatId) {
      return { ok: false, reason: 'missing_chat_id', updateType };
    }

    const chatType = this.readString(
      recipient.chat_type ??
        recipient.chatType ??
        recipient.type ??
        (raw.chat as Record<string, unknown> | undefined)?.type ??
        (raw.chat as Record<string, unknown> | undefined)?.chat_type ??
        raw.chat_type,
    );

    const text = this.readString(body.text ?? message.text ?? raw.text);
    if (!text) {
      return { ok: false, reason: 'missing_text', updateType, chatType, chatId };
    }

    const userId = this.readString(sender.user_id ?? sender.userId ?? raw.user_id ?? raw.userId);
    const username = this.readString(sender.username ?? sender.name);
    const isBotMessage = Boolean(sender.is_bot ?? sender.isBot);

    const messageId = this.readString(
      body.mid ?? message.mid ?? message.message_id ?? message.messageId ?? raw.message_id,
    );

    return {
      ok: true,
      message: {
        updateType: mappedType,
        chatId,
        chatType,
        userId,
        username,
        text,
        messageId,
        isBotMessage,
      },
    };
  }

  isGroupChat(message: NormalizedChatMessage): boolean {
    if (!message.chatType) {
      return true;
    }

    return !PRIVATE_CHAT_TYPES.has(message.chatType.toLowerCase());
  }

  private readString(value: unknown): string | undefined {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
    return undefined;
  }
}
