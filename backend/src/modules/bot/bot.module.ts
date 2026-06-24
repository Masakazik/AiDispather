import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { BotIntegrationModule } from '../bot-integration/bot-integration.module';
import { ChatMessagesModule } from '../chat-messages/chat-messages.module';
import { MaxModule } from '../max/max.module';

@Module({
  imports: [BotIntegrationModule, AiModule, ChatMessagesModule, MaxModule],
})
export class BotModule {}
