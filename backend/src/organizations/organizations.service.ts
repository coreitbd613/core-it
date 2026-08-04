import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { assertCanManageOrg } from '../common/membership.helper';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private async getPrimaryMembership(userId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });
    if (!membership) {
      throw new NotFoundException('You are not a member of any organization.');
    }
    return membership;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name) || 'organization';
    let candidate = base;
    let suffix = 2;
    while (
      await this.prisma.organization.findUnique({ where: { slug: candidate } })
    ) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  async createMine(userId: string, dto: CreateOrganizationDto) {
    const slug = await this.generateUniqueSlug(dto.name);
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: dto.name, slug },
      });
      await tx.membership.create({
        data: {
          userId,
          organizationId: organization.id,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });
      return organization;
    });
  }

  async getMine(userId: string) {
    const membership = await this.getPrimaryMembership(userId);
    return this.prisma.organization.findUniqueOrThrow({
      where: { id: membership.organizationId },
    });
  }

  async updateMine(userId: string, dto: UpdateOrganizationDto) {
    const membership = await this.getPrimaryMembership(userId);
    await assertCanManageOrg(this.prisma, userId, membership.organizationId);
    return this.prisma.organization.update({
      where: { id: membership.organizationId },
      data: dto,
    });
  }

  async updateLogo(userId: string, file: Express.Multer.File) {
    const membership = await this.getPrimaryMembership(userId);
    await assertCanManageOrg(this.prisma, userId, membership.organizationId);

    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { id: membership.organizationId },
    });

    const logoUrl = await this.storageService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    const updated = await this.prisma.organization.update({
      where: { id: membership.organizationId },
      data: { logoUrl },
    });

    if (organization.logoUrl) {
      const oldBlobName = organization.logoUrl.split('/').pop();
      if (oldBlobName) {
        await this.storageService.delete(oldBlobName).catch(() => undefined);
      }
    }

    return updated;
  }

  async listForAdmin() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForAdmin(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }
    return organization;
  }

  async updateForAdmin(id: string, dto: UpdateOrganizationDto) {
    await this.getForAdmin(id);
    return this.prisma.organization.update({ where: { id }, data: dto });
  }
}
