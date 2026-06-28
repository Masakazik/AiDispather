import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RequestPriority, RequestSource } from '@prisma/client';

export class CreateServiceRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @IsOptional()
  @IsEnum(RequestSource)
  source?: RequestSource;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  residentName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  residentPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  apartmentLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  assigneeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  externalChatId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  externalUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  externalMessageId?: string;

  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @IsOptional()
  @IsUUID()
  apartmentId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
