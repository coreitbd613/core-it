import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadSource, LeadStage } from '../../generated/prisma/client';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStageDto } from './dto/update-lead-stage.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto';

const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  WON: 'Won',
  LOST: 'Lost',
};

const detailInclude = {
  activities: { orderBy: { createdAt: 'desc' as const } },
};

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getRawOrThrow(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Lead not found.');
    }
    return lead;
  }

  async createLead(dto: CreateLeadDto, authorName: string) {
    return this.prisma.lead.create({
      data: {
        contactName: dto.contactName,
        companyName: dto.companyName,
        email: dto.email,
        phone: dto.phone,
        source: dto.source,
        sourceDetail: dto.sourceDetail,
        estimatedValueBdt: dto.estimatedValueBdt,
        nextFollowUpAt: dto.nextFollowUpAt ? new Date(dto.nextFollowUpAt) : undefined,
        industry: dto.industry,
        tags: dto.tags ?? [],
        activities: dto.initialNote
          ? {
              create: {
                type: 'NOTE',
                message: dto.initialNote,
                authorName,
              },
            }
          : undefined,
      },
      include: detailInclude,
    });
  }

  async listForAdmin(filters: { stage?: LeadStage; source?: LeadSource }) {
    return this.prisma.lead.findMany({
      where: { stage: filters.stage, source: filters.source },
      include: detailInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForAdmin(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: detailInclude,
    });
    if (!lead) {
      throw new NotFoundException('Lead not found.');
    }
    return lead;
  }

  async updateLead(id: string, dto: UpdateLeadDto) {
    await this.getRawOrThrow(id);
    return this.prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        nextFollowUpAt:
          dto.nextFollowUpAt === undefined
            ? undefined
            : dto.nextFollowUpAt === null
              ? null
              : new Date(dto.nextFollowUpAt),
      },
      include: detailInclude,
    });
  }

  async deleteLead(id: string): Promise<void> {
    await this.getRawOrThrow(id);
    await this.prisma.lead.delete({ where: { id } });
  }

  async updateStage(id: string, dto: UpdateLeadStageDto, authorName: string) {
    const lead = await this.getRawOrThrow(id);
    if (dto.stage === lead.stage) {
      return this.getForAdmin(id);
    }

    const message =
      dto.stage === 'LOST'
        ? `Stage changed to Lost${dto.lostReason?.trim() ? ` — ${dto.lostReason.trim()}` : ''}`
        : `Stage changed to ${LEAD_STAGE_LABELS[dto.stage]}`;

    await this.prisma.lead.update({
      where: { id },
      data: {
        stage: dto.stage,
        lostReason: dto.stage === 'LOST' ? dto.lostReason?.trim() || null : undefined,
        activities: { create: { type: 'STAGE_CHANGE', message, authorName } },
      },
    });
    return this.getForAdmin(id);
  }

  async convert(id: string, authorName: string) {
    await this.getRawOrThrow(id);
    await this.prisma.lead.update({
      where: { id },
      data: {
        stage: 'WON',
        convertedAt: new Date(),
        activities: {
          create: { type: 'CONVERTED', message: 'Converted to customer', authorName },
        },
      },
    });
    return this.getForAdmin(id);
  }

  async updateFollowUp(id: string, dto: UpdateFollowUpDto, authorName: string) {
    await this.getRawOrThrow(id);
    const message = dto.nextFollowUpAt
      ? `Follow-up set for ${new Date(dto.nextFollowUpAt).toLocaleDateString()}`
      : 'Follow-up cleared';

    await this.prisma.lead.update({
      where: { id },
      data: {
        nextFollowUpAt: dto.nextFollowUpAt ? new Date(dto.nextFollowUpAt) : null,
        activities: { create: { type: 'FOLLOW_UP_SCHEDULED', message, authorName } },
      },
    });
    return this.getForAdmin(id);
  }

  async addActivity(id: string, dto: CreateLeadActivityDto, authorName: string) {
    await this.getRawOrThrow(id);
    await this.prisma.lead.update({
      where: { id },
      data: {
        activities: {
          create: { type: 'NOTE', message: dto.message, authorName },
        },
      },
    });
    return this.getForAdmin(id);
  }
}
