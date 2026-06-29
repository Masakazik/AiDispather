import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  emitRequestsUpdated(companyId: string | null): void {
    this.gateway.emitRequestsUpdated(companyId);
  }

  emitChatsUpdated(companyId: string | null): void {
    this.gateway.emitChatsUpdated(companyId);
  }
}
