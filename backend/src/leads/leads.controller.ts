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
import { LeadSource, LeadStage } from '../../generated/prisma/client';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStageDto } from './dto/update-lead-stage.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto';

interface RequestUser {
  id: string;
  email: string;
  name: string | null;
}

@UseGuards(AdminJwtAuthGuard)
@Controller('leads/admin')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto, @CurrentUser() user: RequestUser) {
    return this.leadsService.createLead(dto, user.name ?? user.email);
  }

  @Get()
  listAll(
    @Query('stage') stage?: LeadStage,
    @Query('source') source?: LeadSource,
  ) {
    return this.leadsService.listForAdmin({ stage, source });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.leadsService.getForAdmin(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.updateLead(id, dto);
  }

  @Delete(':id')
  deleteLead(@Param('id') id: string) {
    return this.leadsService.deleteLead(id);
  }

  @Patch(':id/stage')
  updateStage(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStageDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.leadsService.updateStage(id, dto, user.name ?? user.email);
  }

  @Post(':id/convert')
  convert(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.leadsService.convert(id, user.name ?? user.email);
  }

  @Patch(':id/follow-up')
  updateFollowUp(
    @Param('id') id: string,
    @Body() dto: UpdateFollowUpDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.leadsService.updateFollowUp(id, dto, user.name ?? user.email);
  }

  @Post(':id/activities')
  addActivity(
    @Param('id') id: string,
    @Body() dto: CreateLeadActivityDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.leadsService.addActivity(id, dto, user.name ?? user.email);
  }
}
