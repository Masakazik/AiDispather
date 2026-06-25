import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

const STAFF_ROLES = [UserRole.DISPATCHER, UserRole.TECHNICIAN] as const;

export class CreateStaffDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsIn(STAFF_ROLES)
  role?: (typeof STAFF_ROLES)[number];
}
