import { io, type Socket } from 'socket.io-client';
import { config } from '@/constants/config';

type RealtimeEvent = 'requests.updated' | 'chats.updated' | 'realtime.connected';

let socket: Socket | null = null;
let currentToken: string | null = null;

function ensureSocket(token: string): Socket {
  const normalized = token.trim();
  const shouldReconnect = !socket || !socket.connected || currentToken !== normalized;
  if (shouldReconnect) {
    socket?.disconnect();
    socket = io(`${config.wsBaseUrl}/ws`, {
      transports: ['websocket'],
      auth: { token: normalized },
      withCredentials: true,
      autoConnect: true,
    });
    currentToken = normalized;
  }
  if (!socket) {
    throw new Error('Realtime socket init failed');
  }
  return socket;
}

export function connectRealtime(token: string | null | undefined): Socket | null {
  if (!token?.trim()) {
    disconnectRealtime();
    return null;
  }
  return ensureSocket(token);
}

export function disconnectRealtime(): void {
  socket?.disconnect();
  socket = null;
  currentToken = null;
}

export function onRealtimeEvent(event: RealtimeEvent, cb: () => void): () => void {
  if (!socket) return () => undefined;
  socket.on(event, cb);
  return () => socket?.off(event, cb);
}
