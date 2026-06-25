import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  inn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  // Admin account for this company (the УК login).
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  adminName!: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  adminPassword!: string;
}
