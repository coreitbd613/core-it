import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus } from '../../generated/prisma/client';
import {
  assertOrgMembership,
  getActiveOrganizationIds,
} from '../common/membership.helper';
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
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { RespondSupportTicketDto } from './dto/respond-support-ticket.dto';
import { nextProjectCode } from './project-code';

const detailInclude = {
  organization: { select: { id: true, name: true } },
  milestones: { orderBy: { dueAt: 'asc' as const } },
  revisionRequests: { orderBy: { requestedAt: 'desc' as const } },
  credentials: true,
  teamMembers: true,
  supportTickets: { orderBy: { requestedAt: 'desc' as const } },
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolves the public-facing projectCode (e.g. "PRJ-2026-003") to its row, including the internal UUID used for FK writes. */
  private async getRawOrThrow(projectCode: string) {
    const project = await this.prisma.project.findUnique({
      where: { projectCode },
    });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  async createProject(dto: CreateProjectDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    return this.prisma.$transaction(async (tx) => {
      const projectCode = await nextProjectCode(tx);
      return tx.project.create({
        data: {
          projectCode,
          organizationId: dto.organizationId,
          name: dto.name,
          description: dto.description,
          proposalId: dto.proposalId,
          contractId: dto.contractId,
          startedAt: new Date(dto.startedAt),
          targetEndAt: dto.targetEndAt ? new Date(dto.targetEndAt) : undefined,
          includedRevisions: dto.includedRevisions ?? 0,
          supportMonths: dto.supportMonths ?? 0,
          projectType: dto.projectType,
          department: dto.department,
          projectManagerName: dto.projectManagerName,
          paymentTerms: dto.paymentTerms,
          paymentSchedule: dto.paymentSchedule,
          contractValueBdt: dto.contractValueBdt,
          goLiveAt: dto.goLiveAt ? new Date(dto.goLiveAt) : undefined,
          revisionWindowDays: dto.revisionWindowDays,
          maxDaysPerRevision: dto.maxDaysPerRevision,
          extraRevisionPriceBdt: dto.extraRevisionPriceBdt,
          revisionNotes: dto.revisionNotes,
          supportSla: dto.supportSla ?? 'STANDARD',
          supportWorkingHours: dto.supportWorkingHours,
          includedSupportTickets: dto.includedSupportTickets,
          supportContactName: dto.supportContactName,
          sendRenewalReminder: dto.sendRenewalReminder ?? false,
          domain: dto.domain,
          hostingProvider: dto.hostingProvider,
          serverDetails: dto.serverDetails,
          repositoryUrl: dto.repositoryUrl,
          stagingUrl: dto.stagingUrl,
          productionUrl: dto.productionUrl,
          techStack: dto.techStack,
          deploymentMethod: dto.deploymentMethod,
          credentialsNotes: dto.credentialsNotes,
          milestones: dto.milestones?.length
            ? {
                create: dto.milestones.map((m) => ({
                  title: m.title,
                  dueAt: m.dueAt ? new Date(m.dueAt) : undefined,
                })),
              }
            : undefined,
          teamMembers: dto.teamMembers?.length
            ? {
                create: dto.teamMembers.map((t) => ({
                  name: t.name,
                  role: t.role,
                  accessLevel: t.accessLevel ?? 'VIEW',
                })),
              }
            : undefined,
          credentials: dto.credentials?.length
            ? {
                create: dto.credentials.map((c) => ({
                  label: c.label,
                  username: c.username,
                  password: c.password,
                  url: c.url,
                  notes: c.notes,
                })),
              }
            : undefined,
        },
        include: detailInclude,
      });
    });
  }

  async listForAdmin(filters: {
    organizationId?: string;
    status?: ProjectStatus;
  }) {
    return this.prisma.project.findMany({
      where: {
        organizationId: filters.organizationId,
        status: filters.status,
      },
      include: detailInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForAdmin(projectCode: string) {
    const project = await this.prisma.project.findUnique({
      where: { projectCode },
      include: detailInclude,
    });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  async updateProject(projectCode: string, dto: UpdateProjectDto) {
    const project = await this.getRawOrThrow(projectCode);
    return this.prisma.project.update({
      where: { id: project.id },
      data: {
        ...dto,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        targetEndAt: dto.targetEndAt ? new Date(dto.targetEndAt) : undefined,
        goLiveAt: dto.goLiveAt ? new Date(dto.goLiveAt) : undefined,
      },
      include: detailInclude,
    });
  }

  async updateStatus(projectCode: string, dto: UpdateProjectStatusDto) {
    const project = await this.getRawOrThrow(projectCode);
    return this.prisma.project.update({
      where: { id: project.id },
      data: {
        status: dto.status,
        completedAt:
          dto.status === 'COMPLETED' && !project.completedAt
            ? new Date()
            : undefined,
      },
      include: detailInclude,
    });
  }

  async deleteProject(projectCode: string): Promise<void> {
    const project = await this.getRawOrThrow(projectCode);
    await this.prisma.project.delete({ where: { id: project.id } });
  }

  async listForUser(userId: string, organizationId?: string) {
    const orgIds = await getActiveOrganizationIds(this.prisma, userId);
    if (organizationId) {
      await assertOrgMembership(this.prisma, userId, organizationId);
    }
    return this.prisma.project.findMany({
      where: { organizationId: organizationId ?? { in: orgIds } },
      include: detailInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForUser(userId: string, projectCode: string) {
    const project = await this.prisma.project.findUnique({
      where: { projectCode },
      include: detailInclude,
    });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    const orgIds = await getActiveOrganizationIds(this.prisma, userId);
    if (!orgIds.includes(project.organizationId)) {
      // 404, not 403 — same reasoning as invoices.service.ts: avoid revealing
      // that a project with this code exists for an org the caller isn't in.
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  /** Narrow client-facing create — used by the "sign contract" flow to start a project for their own org. */
  async createForUser(userId: string, dto: CreateProjectDto) {
    await assertOrgMembership(this.prisma, userId, dto.organizationId);
    return this.createProject(dto);
  }

  // --- Milestones ---

  async addMilestone(projectCode: string, dto: CreateProjectMilestoneDto) {
    const project = await this.getRawOrThrow(projectCode);
    return this.prisma.projectMilestone.create({
      data: {
        projectId: project.id,
        title: dto.title,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
    });
  }

  async updateMilestone(
    projectCode: string,
    milestoneId: string,
    dto: UpdateMilestoneDto,
  ) {
    const project = await this.getRawOrThrow(projectCode);
    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone || milestone.projectId !== project.id) {
      throw new NotFoundException('Milestone not found.');
    }
    return this.prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        title: dto.title,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        status: dto.status,
        completedAt: dto.status === 'DONE' ? new Date() : undefined,
      },
    });
  }

  async deleteMilestone(
    projectCode: string,
    milestoneId: string,
  ): Promise<void> {
    const project = await this.getRawOrThrow(projectCode);
    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone || milestone.projectId !== project.id) {
      throw new NotFoundException('Milestone not found.');
    }
    await this.prisma.projectMilestone.delete({ where: { id: milestoneId } });
  }

  // --- Revision requests ---

  /** Client-facing file: validates org membership via getForUser before filing. */
  async fileRevisionRequestForUser(
    userId: string,
    projectCode: string,
    dto: CreateRevisionRequestDto,
    requestedBy: string,
  ) {
    await this.getForUser(userId, projectCode);
    return this.fileRevisionRequest(projectCode, dto, requestedBy);
  }

  async fileRevisionRequest(
    projectCode: string,
    dto: CreateRevisionRequestDto,
    requestedBy: string,
  ) {
    const project = await this.getRawOrThrow(projectCode);
    return this.prisma.projectRevisionRequest.create({
      data: {
        projectId: project.id,
        description: dto.description,
        requestedBy: dto.requestedBy ?? requestedBy,
      },
    });
  }

  async respondToRevisionRequest(
    projectCode: string,
    revisionId: string,
    dto: RespondRevisionRequestDto,
  ) {
    const project = await this.getRawOrThrow(projectCode);
    const revision = await this.prisma.projectRevisionRequest.findUnique({
      where: { id: revisionId },
    });
    if (!revision || revision.projectId !== project.id) {
      throw new NotFoundException('Revision request not found.');
    }
    return this.prisma.projectRevisionRequest.update({
      where: { id: revisionId },
      // Only DONE stamps respondedAt — IN_PROGRESS/OPEN leave it untouched,
      // matching the original mock behavior.
      data: {
        status: dto.status,
        respondedAt: dto.status === 'DONE' ? new Date() : undefined,
      },
    });
  }

  // --- Credentials ---

  async addCredential(projectCode: string, dto: CreateProjectCredentialDto) {
    const project = await this.getRawOrThrow(projectCode);
    return this.prisma.projectCredential.create({
      data: {
        projectId: project.id,
        label: dto.label,
        username: dto.username,
        password: dto.password,
        url: dto.url,
        notes: dto.notes,
      },
    });
  }

  async updateCredential(
    projectCode: string,
    credentialId: string,
    dto: UpdateProjectCredentialDto,
  ) {
    const project = await this.getRawOrThrow(projectCode);
    const credential = await this.prisma.projectCredential.findUnique({
      where: { id: credentialId },
    });
    if (!credential || credential.projectId !== project.id) {
      throw new NotFoundException('Credential not found.');
    }
    return this.prisma.projectCredential.update({
      where: { id: credentialId },
      data: dto,
    });
  }

  async deleteCredential(
    projectCode: string,
    credentialId: string,
  ): Promise<void> {
    const project = await this.getRawOrThrow(projectCode);
    const credential = await this.prisma.projectCredential.findUnique({
      where: { id: credentialId },
    });
    if (!credential || credential.projectId !== project.id) {
      throw new NotFoundException('Credential not found.');
    }
    await this.prisma.projectCredential.delete({ where: { id: credentialId } });
  }

  // --- Team members ---

  async addTeamMember(projectCode: string, dto: CreateProjectTeamMemberDto) {
    const project = await this.getRawOrThrow(projectCode);
    return this.prisma.projectTeamMember.create({
      data: {
        projectId: project.id,
        name: dto.name,
        role: dto.role,
        accessLevel: dto.accessLevel ?? 'VIEW',
      },
    });
  }

  async updateTeamMember(
    projectCode: string,
    teamMemberId: string,
    dto: UpdateProjectTeamMemberDto,
  ) {
    const project = await this.getRawOrThrow(projectCode);
    const teamMember = await this.prisma.projectTeamMember.findUnique({
      where: { id: teamMemberId },
    });
    if (!teamMember || teamMember.projectId !== project.id) {
      throw new NotFoundException('Team member not found.');
    }
    return this.prisma.projectTeamMember.update({
      where: { id: teamMemberId },
      data: dto,
    });
  }

  async deleteTeamMember(
    projectCode: string,
    teamMemberId: string,
  ): Promise<void> {
    const project = await this.getRawOrThrow(projectCode);
    const teamMember = await this.prisma.projectTeamMember.findUnique({
      where: { id: teamMemberId },
    });
    if (!teamMember || teamMember.projectId !== project.id) {
      throw new NotFoundException('Team member not found.');
    }
    await this.prisma.projectTeamMember.delete({ where: { id: teamMemberId } });
  }

  // --- Support tickets ---

  /** Client-facing file: validates org membership via getForUser before filing. */
  async fileSupportTicketForUser(
    userId: string,
    projectCode: string,
    dto: CreateSupportTicketDto,
    requestedBy: string,
  ) {
    await this.getForUser(userId, projectCode);
    return this.fileSupportTicket(projectCode, dto, requestedBy);
  }

  async fileSupportTicket(
    projectCode: string,
    dto: CreateSupportTicketDto,
    requestedBy: string,
  ) {
    const project = await this.getRawOrThrow(projectCode);
    return this.prisma.projectSupportTicket.create({
      data: {
        projectId: project.id,
        subject: dto.subject,
        description: dto.description,
        requestedBy: dto.requestedBy ?? requestedBy,
      },
    });
  }

  async respondToSupportTicket(
    projectCode: string,
    ticketId: string,
    dto: RespondSupportTicketDto,
  ) {
    const project = await this.getRawOrThrow(projectCode);
    const ticket = await this.prisma.projectSupportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket || ticket.projectId !== project.id) {
      throw new NotFoundException('Support ticket not found.');
    }
    return this.prisma.projectSupportTicket.update({
      where: { id: ticketId },
      // Only RESOLVED stamps resolvedAt — IN_PROGRESS/OPEN leave it
      // untouched, matching the revision-request respondedAt convention.
      data: {
        status: dto.status,
        resolvedAt: dto.status === 'RESOLVED' ? new Date() : undefined,
      },
    });
  }
}
