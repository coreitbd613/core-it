import {
  Body,
  Controller,
  Delete,
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
import { InvoiceStatus } from '../../generated/prisma/client';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { VoidInvoiceDto } from './dto/void-invoice.dto';

interface RequestUser {
  id: string;
}

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('public/:id')
  getPublic(@Param('id') id: string) {
    return this.invoicesService.getPublic(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  listMine(
    @CurrentUser() user: RequestUser,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.invoicesService.listForUser(user.id, organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine/:id')
  getMine(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.invoicesService.getForUser(user.id, id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin')
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.createInvoice(dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin')
  listAll(
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.invoicesService.listForAdmin({ organizationId, status });
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/:id')
  getOne(@Param('id') id: string) {
    return this.invoicesService.getForAdmin(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.updateInvoice(id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id/send')
  send(@Param('id') id: string) {
    return this.invoicesService.sendInvoice(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id/void')
  void(@Param('id') id: string, @Body() dto: VoidInvoiceDto) {
    return this.invoicesService.voidInvoice(id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin/:id/payments')
  recordPayment(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.invoicesService.recordPayment(id, user.id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('admin/:id')
  deleteDraft(@Param('id') id: string) {
    return this.invoicesService.deleteDraft(id);
  }
}
