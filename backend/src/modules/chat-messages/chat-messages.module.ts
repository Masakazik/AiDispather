import { Module, forwardRef } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { MaxModule } from '../max/max.module';
import { ChatMessagesService } from './chat-messages.service';

@Module({
  imports: [AiModule, forwardRef(() => MaxModule)],
  providers: [ChatMessagesService],
  exports: [ChatMessagesService],
})
export class ChatMessagesModule {}
