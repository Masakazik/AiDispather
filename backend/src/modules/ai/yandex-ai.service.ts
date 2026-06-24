import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AppLogger } from '../../common/logger/app-logger.service';
import type { AppConfig } from '../../config/configuration';
import { AiResponse, aiResponseSchema } from './schemas/ai-response.schema';

@Injectable()
export class YandexAiService {
  private readonly client: OpenAI;
  private readonly promptId: string;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly logger: AppLogger,
  ) {
    const apiKey = this.config.get('yandexAi.apiKey', { infer: true });
    const baseURL = this.config.get('yandexAi.baseUrl', { infer: true });
    const projectId = this.config.get('yandexAi.projectId', { infer: true });
    this.promptId = this.config.get('yandexAi.promptId', { infer: true });

    this.client = new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: {
        'OpenAI-Project': projectId,
      },
    });
  }

  async analyzeMessage(text: string): Promise<AiResponse> {
    const response = await this.client.responses.create({
      prompt: { id: this.promptId },
      input: text,
    });

    const rawOutput = response.output_text?.trim();
    if (!rawOutput) {
      throw new Error('Yandex AI response is empty');
    }

    const parsedJson = this.parseJsonOutput(rawOutput);
    const result = aiResponseSchema.safeParse(parsedJson);
    if (!result.success) {
      this.logger.error(
        JSON.stringify({
          event: 'ai_response_invalid',
          rawOutput,
          issues: result.error.issues,
        }),
        undefined,
        'YandexAi',
      );
      throw new Error('Yandex AI response does not match expected schema');
    }

    return result.data;
  }

  private parseJsonOutput(rawOutput: string): unknown {
    try {
      return JSON.parse(rawOutput);
    } catch {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Yandex AI response is not valid JSON');
      }
      return JSON.parse(jsonMatch[0]);
    }
  }
}
