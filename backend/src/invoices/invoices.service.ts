import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DiscountType, InvoiceStatus } from '../../generated/prisma/client';
import { computeInvoiceTotals } from './invoice-calculations';
import { nextInvoiceNumber } from './invoice-number';
import {
  assertOrgMembership,
  getActiveOrganizationIds,
} from '../common/membership.helper';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { VoidInvoiceDto } from './dto/void-invoice.dto';

// The org's OWNER membership (earliest one, in case of a data anomaly with
// more than one) — surfaced on invoices as the bill-to contact name/phone.
const organizationSelect = {
  id: true,
  name: true,
  phone: true,
  memberships: {
    where: { role: 'OWNER' as const },
    orderBy: { createdAt: 'asc' as const },
    take: 1,
    select: { user: { select: { name: true, email: true, contactNumber: true } } },
  },
};

const detailInclude = {
  organization: { select: organizationSelect },
  lineItems: true,
  payments: {
    include: {
      recordedByUser: { select: { id: true, name: true, email: true } },
    },
    orderBy: { paidAt: 'asc' as const },
  },
};

const publicInclude = {
  organization: { select: organizationSelect },
  lineItems: true,
  // recordedByUser is deliberately excluded here — staff identity isn't
  // client-facing (mirrors the frontend's public Transactions table).
  payments: { orderBy: { paidAt: 'asc' as const } },
};

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Attaches derived totals/status (without ever overwriting the stored
   * `status`) and flattens organization.memberships[0].user into plain
   * ownerName/contactPhone, so the frontend gets a flat organization shape.
   * contactPhone prioritizes the org's own phone, falling back to the
   * owner's contact number when the org hasn't set one.
   */
  private attachComputed<
    T extends {
      lineItems: { unitPriceBdt: unknown }[];
      payments: { amountBdt: unknown }[];
      taxPercent: number;
      discountType: DiscountType;
      discountPercent: number;
      discountFlatBdt: unknown;
      status: InvoiceStatus;
      dueAt: Date;
      organization: {
        id: string;
        name: string;
        phone: string | null;
        memberships: {
          user: { name: string | null; email: string; contactNumber: string | null };
        }[];
      } | null;
    },
  >(invoice: T) {
    const { organization, ...rest } = invoice;
    const owner = organization?.memberships[0]?.user;
    return {
      ...rest,
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
            ownerName: owner?.name ?? owner?.email ?? null,
            contactPhone: organization.phone || owner?.contactNumber || null,
          }
        : null,
      computed: computeInvoiceTotals(invoice as never),
    };
  }

  private async getRawOrThrow(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }
    return invoice;
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const customerName = dto.customerName?.trim() || undefined;
    const customerCompanyName = dto.customerCompanyName?.trim() || undefined;
    if (!dto.organizationId && !customerName) {
      throw new BadRequestException(
        'Provide either an organizationId or a customerName.',
      );
    }
    if (dto.organizationId && customerName) {
      throw new BadRequestException(
        'Provide either an organizationId or a customerName, not both.',
      );
    }

    if (dto.organizationId) {
      const organization = await this.prisma.organization.findUnique({
        where: { id: dto.organizationId },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found.');
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const number = await nextInvoiceNumber(tx);
      return tx.invoice.create({
        data: {
          number,
          organizationId: dto.organizationId,
          customerName,
          customerCompanyName: dto.organizationId ? undefined : customerCompanyName,
          proposalId: dto.proposalId,
          status: dto.status ?? 'DRAFT',
          taxPercent: dto.taxPercent ?? 0,
          discountType: dto.discountType ?? 'PERCENT',
          discountPercent: dto.discountPercent ?? 0,
          discountFlatBdt: dto.discountFlatBdt ?? 0,
          notes: dto.notes,
          dueAt: new Date(dto.dueAt),
          lineItems: {
            create: dto.lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPriceBdt: item.unitPriceBdt,
            })),
          },
        },
        include: detailInclude,
      });
    });

    return this.attachComputed(created);
  }

  async listForAdmin(filters: {
    organizationId?: string;
    status?: InvoiceStatus;
  }) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId: filters.organizationId,
        status: filters.status,
      },
      include: detailInclude,
      orderBy: { createdAt: 'desc' },
    });
    return invoices.map((invoice) => this.attachComputed(invoice));
  }

  async getForAdmin(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: detailInclude,
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }
    return this.attachComputed(invoice);
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.getRawOrThrow(id);
    if (invoice.status !== 'DRAFT') {
      throw new ConflictException('Only draft invoices can be edited.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.lineItems) {
        await tx.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
      }
      return tx.invoice.update({
        where: { id },
        data: {
          dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
          taxPercent: dto.taxPercent,
          discountType: dto.discountType,
          discountPercent: dto.discountPercent,
          discountFlatBdt: dto.discountFlatBdt,
          notes: dto.notes,
          lineItems: dto.lineItems
            ? {
                create: dto.lineItems.map((item) => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPriceBdt: item.unitPriceBdt,
                })),
              }
            : undefined,
        },
        include: detailInclude,
      });
    });

    return this.attachComputed(updated);
  }

  async sendInvoice(id: string) {
    const invoice = await this.getRawOrThrow(id);
    if (invoice.status !== 'DRAFT') {
      throw new ConflictException('Only draft invoices can be sent.');
    }
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT' },
      include: detailInclude,
    });
    return this.attachComputed(updated);
  }

  async voidInvoice(id: string, dto: VoidInvoiceDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: detailInclude,
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }

    const derivedStatus = computeInvoiceTotals(invoice).status;
    if (
      invoice.status === 'DRAFT' ||
      invoice.status === 'CANCELLED' ||
      derivedStatus === 'PAID'
    ) {
      throw new ConflictException('This invoice can’t be voided.');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED', voidReason: dto.voidReason },
      include: detailInclude,
    });
    return this.attachComputed(updated);
  }

  async recordPayment(id: string, adminUserId: string, dto: RecordPaymentDto) {
    const invoice = await this.getRawOrThrow(id);
    if (invoice.status === 'DRAFT' || invoice.status === 'CANCELLED') {
      throw new ConflictException(
        'Payments can only be recorded on sent invoices.',
      );
    }

    await this.prisma.payment.create({
      data: {
        invoiceId: id,
        amountBdt: dto.amountBdt,
        method: dto.method,
        note: dto.note,
        transactionId: dto.transactionId?.trim() || undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
        recordedByUserId: adminUserId,
      },
    });

    const updated = await this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: detailInclude,
    });
    return this.attachComputed(updated);
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.getRawOrThrow(id);
    await this.prisma.invoice.delete({ where: { id } });
  }

  async listForUser(userId: string, organizationId?: string) {
    const orgIds = await getActiveOrganizationIds(this.prisma, userId);

    if (organizationId) {
      await assertOrgMembership(this.prisma, userId, organizationId);
    }

    const invoices = await this.prisma.invoice.findMany({
      where: {
        organizationId: organizationId ?? { in: orgIds },
        // DRAFT invoices aren't sent yet — they stay admin-only.
        status: { not: 'DRAFT' },
      },
      include: detailInclude,
      orderBy: { createdAt: 'desc' },
    });
    return invoices.map((invoice) => this.attachComputed(invoice));
  }

  async getForUser(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: detailInclude,
    });
    if (!invoice || invoice.status === 'DRAFT') {
      // Also 404s on DRAFT — unsent invoices are admin-only.
      throw new NotFoundException('Invoice not found.');
    }

    const orgIds = await getActiveOrganizationIds(this.prisma, userId);
    if (!invoice.organizationId || !orgIds.includes(invoice.organizationId)) {
      // 404, not 403 — avoid revealing that an invoice with this id exists
      // for an organization the requester doesn't belong to (or that it's
      // an ad-hoc invoice with no organization at all).
      throw new NotFoundException('Invoice not found.');
    }

    return this.attachComputed(invoice);
  }

  async getPublic(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: publicInclude,
    });
    if (!invoice || invoice.status === 'DRAFT') {
      // Also 404s on DRAFT — an unsent invoice's public link shouldn't work
      // even if someone has (or guesses) the URL.
      throw new NotFoundException('Invoice not found.');
    }
    return this.attachComputed(invoice);
  }
}
