import { http } from './http';

export interface MaxChatMessage {
  id: string;
  chatId: string;
  messageId: string | null;
  buildingId: string | null;
  buildingName: string;
  author: string;
  text: string;
  createdAt: string;
  incoming: boolean;
}

export interface MaxChatThread {
  id: string;
  chatId: string;
  chatLabel: string;
  routable: boolean;
  buildingId: string | null;
  buildingName: string;
  unread: number;
  lastAt: string;
  messages: MaxChatMessage[];
}

export interface MaxReplyResponse {
  ok: boolean;
  chatId: string;
  messageId: string | null;
}

export interface MaxBroadcastItem {
  chatId: string;
  ok: boolean;
  messageId?: string;
  error?: string;
}

export interface MaxBroadcastResponse {
  ok: boolean;
  total: number;
  sent: number;
  failed: number;
  results: MaxBroadcastItem[];
}

export const maxChatsService = {
  async listThreads(): Promise<MaxChatThread[]> {
    const { data } = await http.get<{ threads: MaxChatThread[] }>('/max/chats/threads');
    return data.threads;
  },

  async reply(chatId: string, text: string): Promise<MaxReplyResponse> {
    const { data } = await http.post<MaxReplyResponse>('/max/chats/reply', { chatId, text });
    return data;
  },

  async broadcast(chatIds: string[], text: string): Promise<MaxBroadcastResponse> {
    const { data } = await http.post<MaxBroadcastResponse>('/max/chats/broadcast', { chatIds, text });
    return data;
  },

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    await http.delete(`/max/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}`);
  },
};
