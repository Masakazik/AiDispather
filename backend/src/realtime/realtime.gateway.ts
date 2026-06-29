import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { AppLogger } from '../common/logger/app-logger.service';
import type { AppConfig } from '../config/configuration';
import type { JwtPayload } from '../common/interfaces/authenticated-user.interface';

const GLOBAL_ROOM = 'company:__global__';

@Injectable()
@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly logger: AppLogger,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.get('jwt', { infer: true }).secret,
      });
      const room = this.companyRoom(payload.companyId ?? null);
      await client.join(room);
      client.emit('realtime.connected', { room });
      this.logger.debug(
        JSON.stringify({ event: 'ws_connected', userId: payload.sub, room }),
        'Realtime',
      );
    } catch (error) {
      this.logger.warn(
        `WS auth failed: ${error instanceof Error ? error.message : String(error)}`,
        'Realtime',
      );
      client.disconnect(true);
    }
  }

  emitRequestsUpdated(companyId: string | null): void {
    this.server.to(this.companyRoom(companyId)).emit('requests.updated');
  }

  emitChatsUpdated(companyId: string | null): void {
    this.server.to(this.companyRoom(companyId)).emit('chats.updated');
  }

  private companyRoom(companyId: string | null): string {
    return companyId ? `company:${companyId}` : GLOBAL_ROOM;
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.trim();
    }
    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7).trim();
    }
    return null;
  }
}
