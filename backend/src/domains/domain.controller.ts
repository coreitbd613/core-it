import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DomainService } from './domain.service';
import { CreateDomainOrderDto } from './dto/create-domain-order.dto';
import { UpdateDomainOrderStatusDto } from './dto/update-domain-order-status.dto';

interface RequestUser {
  id: string;
}

@Controller('domains')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get('search')
  search(@Query('q') query: string) {
    return this.domainService.search(query ?? '');
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  createOrder(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateDomainOrderDto,
  ) {
    return this.domainService.createOrder(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/mine')
  listMyOrders(@CurrentUser() user: RequestUser) {
    return this.domainService.listOrdersForUser(user.id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/orders')
  listAllOrders() {
    return this.domainService.listAllOrders();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/orders/:id')
  getOrder(@Param('id') id: string) {
    return this.domainService.getOrder(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/orders/:id')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDomainOrderStatusDto,
  ) {
    return this.domainService.updateOrderStatus(id, dto);
  }
}
