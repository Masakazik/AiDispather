import { Module } from '@nestjs/common';
import { YandexAiService } from './yandex-ai.service';

@Module({
  providers: [YandexAiService],
  exports: [YandexAiService],
})
export class AiModule {}
