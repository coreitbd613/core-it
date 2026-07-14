import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { findHostingPlan, HOSTING_PLANS } from './hosting-plans';
import { CreateHostingOrderDto } from './dto/create-hosting-order.dto';
import { UpdateHostingOrderStatusDto } from './dto/update-hosting-order-status.dto';

@Injectable()
export class HostingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private exchangeRate(): number {
    return Number(this.configService.get<string>('USD_TO_BDT_RATE', '122'));
  }

  listPlans() {
    const rate = this.exchangeRate();
    return HOSTING_PLANS.map((plan) => ({
      ...plan,
      priceBdt: Math.round(plan.priceUsd * rate),
    }));
  }

  async createOrder(userId: string, dto: CreateHostingOrderDto) {
    const plan = findHostingPlan(dto.planSlug);
    if (!plan) {
      throw new BadRequestException('Select a valid hosting plan.');
    }

    const rate = this.exchangeRate();

    return this.prisma.hostingOrder.create({
      data: {
        userId,
        planSlug: plan.slug,
        planName: plan.name,
        vcpu: plan.vcpu,
        ramGb: plan.ramGb,
        storageGb: plan.storageGb,
        bandwidthTb: plan.bandwidthTb,
        priceUsd: plan.priceUsd,
        priceBdt: Math.round(plan.priceUsd * rate),
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        notes: dto.notes,
      },
    });
  }

  async listOrdersForUser(userId: string) {
    return this.prisma.hostingOrder.findMany({
      where: { userId },
      // adminNote is deliberately excluded here — it's an internal note for
      // staff reviewing the order and must never reach the customer.
      select: {
        id: true,
        planSlug: true,
        planName: true,
        vcpu: true,
        ramGb: true,
        storageGb: true,
        bandwidthTb: true,
        priceUsd: true,
        priceBdt: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllOrders() {
    return this.prisma.hostingOrder.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(id: string) {
    const order = await this.prisma.hostingOrder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Hosting order not found.');
    }

    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateHostingOrderStatusDto) {
    await this.getOrder(id);

    return this.prisma.hostingOrder.update({
      where: { id },
      data: {
        status: dto.status,
        adminNote: dto.adminNote,
      },
    });
  }
}
