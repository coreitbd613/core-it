import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/customers')
  listCustomers() {
    return this.usersService.listCustomers();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('admin/customers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCustomer(
    @CurrentUser() admin: { id: string },
    @Param('id') id: string,
  ) {
    if (admin.id === id) {
      throw new ForbiddenException("You can't delete your own account.");
    }
    await this.usersService.deleteCustomer(id);
  }
}
