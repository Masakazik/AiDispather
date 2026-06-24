export interface MaxUpdateDto {
  updateType: string;
  chat: {
    chatId: string;
    chatType?: string;
  };
  user?: {
    userId: string;
    username?: string;
    isBot?: boolean;
  };
  text?: string;
  messageId?: string;
}

export interface NormalizedChatMessage {
  updateType: string;
  chatId: string;
  chatType?: string;
  userId?: string;
  username?: string;
  text: string;
  messageId?: string;
  isBotMessage: boolean;
}
