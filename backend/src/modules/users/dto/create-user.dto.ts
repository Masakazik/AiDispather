import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
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
  @IsEnum(UserRole)
  role?: UserRole;
}
