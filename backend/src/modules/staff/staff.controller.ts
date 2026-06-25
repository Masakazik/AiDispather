import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

/**
 * Staff (company employees) management — for a company admin (УК).
 * Every account is scoped to the admin's own company.
 */
@Controller('staff')
@Roles(UserRole.ADMIN)
export class StaffController {
  constructor(private readonly users: UsersService) {}

  private companyId(user: AuthenticatedUser): string {
    if (!user.companyId) {
      throw new ForbiddenException('Учётная запись не привязана к управляющей компании');
    }
    return user.companyId;
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.users.listByCompany(this.companyId(user));
  }

  @Post()
  create(@Body() dto: CreateStaffDto, @CurrentUser() user: AuthenticatedUser) {
    return this.users.createAccount({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role ?? UserRole.DISPATCHER,
      companyId: this.companyId(user),
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.users.updateInCompany(id, dto, this.companyId(user));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.id === id) {
      throw new BadRequestException('Нельзя удалить собственную учётную запись');
    }
    return this.users.removeInCompany(id, this.companyId(user));
  }
}
