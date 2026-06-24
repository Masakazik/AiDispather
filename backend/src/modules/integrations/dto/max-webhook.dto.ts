import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Payload sent by the MAX messenger chat-bot.
 * When `is_problem` is false we acknowledge and create nothing.
 */
export class MaxWebhookDto {
  @IsBoolean()
  is_problem!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  priority?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  user_message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  external_chat_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  resident_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;
}
