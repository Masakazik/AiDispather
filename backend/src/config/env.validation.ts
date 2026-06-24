import { plainToInstance } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsOptional()
  NODE_ENV?: string;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  MAX_WEBHOOK_SECRET?: string;

  @IsString()
  @IsOptional()
  MAX_BOT_TOKEN?: string;

  @IsString()
  @IsOptional()
  MAX_API_BASE_URL?: string;

  @IsIn(['webhook', 'long_polling'])
  @IsOptional()
  MAX_MODE?: 'webhook' | 'long_polling';

  @IsNumber()
  @IsOptional()
  MAX_LONG_POLLING_TIMEOUT_SEC?: number;

  @IsString()
  @IsOptional()
  YANDEX_AI_API_KEY?: string;

  @IsString()
  @IsOptional()
  YANDEX_AI_BASE_URL?: string;

  @IsString()
  @IsOptional()
  YANDEX_AI_PROJECT_ID?: string;

  @IsString()
  @IsOptional()
  YANDEX_AI_PROMPT_ID?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('\n')}`,
    );
  }
  return validated;
}
