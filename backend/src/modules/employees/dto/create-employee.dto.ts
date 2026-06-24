import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { EmployeePresence } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  role!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsEnum(EmployeePresence)
  presence?: EmployeePresence;
}
