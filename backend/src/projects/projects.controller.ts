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
import { ProjectStatus } from '../../generated/prisma/client';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { CreateProjectMilestoneDto } from './dto/create-project-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { CreateRevisionRequestDto } from './dto/create-revision-request.dto';
import { RespondRevisionRequestDto } from './dto/respond-revision-request.dto';
import { CreateProjectCredentialDto } from './dto/create-project-credential.dto';
import { UpdateProjectCredentialDto } from './dto/update-project-credential.dto';
import { CreateProjectTeamMemberDto } from './dto/create-project-team-member.dto';
import { UpdateProjectTeamMemberDto } from './dto/update-project-team-member.dto';

interface RequestUser {
  id: string;
  email: string;
  name: string | null;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // --- Client-facing ("mine") ---

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  listMine(
    @CurrentUser() user: RequestUser,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.projectsService.listForUser(user.id, organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine/:id')
  getMine(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.projectsService.getForUser(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mine')
  createMine(@CurrentUser() user: RequestUser, @Body() dto: CreateProjectDto) {
    return this.projectsService.createForUser(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mine/:id/revisions')
  fileRevisionMine(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CreateRevisionRequestDto,
  ) {
    return this.projectsService.fileRevisionRequestForUser(
      user.id,
      id,
      dto,
      user.name ?? user.email,
    );
  }

  // --- Admin ---

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin')
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin')
  listAll(
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: ProjectStatus,
  ) {
    return this.projectsService.listForAdmin({ organizationId, status });
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/:id')
  getOne(@Param('id') id: string) {
    return this.projectsService.getForAdmin(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.updateProject(id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateProjectStatusDto) {
    return this.projectsService.updateStatus(id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('admin/:id')
  deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }

  // --- Milestones ---

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin/:id/milestones')
  addMilestone(
    @Param('id') id: string,
    @Body() dto: CreateProjectMilestoneDto,
  ) {
    return this.projectsService.addMilestone(id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id/milestones/:milestoneId')
  updateMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
  ) {
    return this.projectsService.updateMilestone(id, milestoneId, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('admin/:id/milestones/:milestoneId')
  deleteMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.projectsService.deleteMilestone(id, milestoneId);
  }

  // --- Revision requests ---

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin/:id/revisions')
  fileRevisionAdmin(
    @Param('id') id: string,
    @Body() dto: CreateRevisionRequestDto,
  ) {
    return this.projectsService.fileRevisionRequest(id, dto, 'Admin');
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id/revisions/:revisionId/respond')
  respondToRevision(
    @Param('id') id: string,
    @Param('revisionId') revisionId: string,
    @Body() dto: RespondRevisionRequestDto,
  ) {
    return this.projectsService.respondToRevisionRequest(id, revisionId, dto);
  }

  // --- Credentials ---

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin/:id/credentials')
  addCredential(
    @Param('id') id: string,
    @Body() dto: CreateProjectCredentialDto,
  ) {
    return this.projectsService.addCredential(id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id/credentials/:credentialId')
  updateCredential(
    @Param('id') id: string,
    @Param('credentialId') credentialId: string,
    @Body() dto: UpdateProjectCredentialDto,
  ) {
    return this.projectsService.updateCredential(id, credentialId, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('admin/:id/credentials/:credentialId')
  deleteCredential(
    @Param('id') id: string,
    @Param('credentialId') credentialId: string,
  ) {
    return this.projectsService.deleteCredential(id, credentialId);
  }

  // --- Team members ---

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin/:id/team')
  addTeamMember(
    @Param('id') id: string,
    @Body() dto: CreateProjectTeamMemberDto,
  ) {
    return this.projectsService.addTeamMember(id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/:id/team/:teamMemberId')
  updateTeamMember(
    @Param('id') id: string,
    @Param('teamMemberId') teamMemberId: string,
    @Body() dto: UpdateProjectTeamMemberDto,
  ) {
    return this.projectsService.updateTeamMember(id, teamMemberId, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete('admin/:id/team/:teamMemberId')
  deleteTeamMember(
    @Param('id') id: string,
    @Param('teamMemberId') teamMemberId: string,
  ) {
    return this.projectsService.deleteTeamMember(id, teamMemberId);
  }
}
