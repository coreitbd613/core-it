import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HostingService } from './hosting.service';
import { CreateHostingOrderDto } from './dto/create-hosting-order.dto';
import { UpdateHostingOrderStatusDto } from './dto/update-hosting-order-status.dto';

interface RequestUser {
  id: string;
}

@Controller('hosting')
export class HostingController {
  constructor(private readonly hostingService: HostingService) {}

  @Get('plans')
  listPlans() {
    return this.hostingService.listPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  createOrder(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateHostingOrderDto,
  ) {
    return this.hostingService.createOrder(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/mine')
  listMyOrders(@CurrentUser() user: RequestUser) {
    return this.hostingService.listOrdersForUser(user.id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/orders')
  listAllOrders() {
    return this.hostingService.listAllOrders();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/orders/:id')
  getOrder(@Param('id') id: string) {
    return this.hostingService.getOrder(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/orders/:id')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateHostingOrderStatusDto,
  ) {
    return this.hostingService.updateOrderStatus(id, dto);
  }
}
