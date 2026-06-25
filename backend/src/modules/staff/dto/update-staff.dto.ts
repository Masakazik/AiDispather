import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

const STAFF_ROLES = [UserRole.DISPATCHER, UserRole.TECHNICIAN] as const;

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(STAFF_ROLES)
  role?: (typeof STAFF_ROLES)[number];

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password?: string;
}
