import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NamecheapService } from '../namecheap/namecheap.service';
import { CreateDomainOrderDto } from './dto/create-domain-order.dto';
import { UpdateDomainOrderStatusDto } from './dto/update-domain-order-status.dto';

const COMMON_TLDS = ['com', 'net', 'org', 'io', 'co', 'xyz', 'info'];

export interface DomainSearchResult {
  domain: string;
  tld: string;
  available: boolean;
  isPremium: boolean;
  priceUsd: number;
  priceBdt: number;
}

@Injectable()
export class DomainService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly namecheapService: NamecheapService,
    private readonly configService: ConfigService,
  ) {}

  private exchangeRate(): number {
    return Number(this.configService.get<string>('USD_TO_BDT_RATE', '122'));
  }

  private parseQuery(query: string): { domain: string; tld: string }[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      throw new BadRequestException('Enter a domain name to search.');
    }

    if (trimmed.includes('.')) {
      const tld = trimmed.slice(trimmed.indexOf('.') + 1);
      return [{ domain: trimmed, tld }];
    }

    return COMMON_TLDS.map((tld) => ({
      domain: `${trimmed}.${tld}`,
      tld,
    }));
  }

  async search(query: string): Promise<DomainSearchResult[]> {
    const candidates = this.parseQuery(query);
    const availability = await this.namecheapService.checkAvailability(
      candidates.map((candidate) => candidate.domain),
    );
    const rate = this.exchangeRate();

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const match = availability.find(
          (result) => result.domain === candidate.domain,
        );

        if (!match || !match.available) {
          return {
            domain: candidate.domain,
            tld: candidate.tld,
            available: false,
            isPremium: false,
            priceUsd: 0,
            priceBdt: 0,
          };
        }

        const priceUsd = match.isPremium
          ? (match.premiumPriceUsd ?? 0)
          : await this.namecheapService.getPricing(candidate.tld);

        return {
          domain: candidate.domain,
          tld: candidate.tld,
          available: true,
          isPremium: match.isPremium,
          priceUsd,
          priceBdt: Math.round(priceUsd * rate),
        };
      }),
    );

    // Keep the COMMON_TLDS priority order (.com first, etc.) regardless of
    // availability — taken domains shouldn't get bumped to the bottom.
    return results;
  }

  async createOrder(userId: string, dto: CreateDomainOrderDto) {
    const domainName = dto.domainName.trim().toLowerCase();
    const tld = dto.tld.trim().toLowerCase();

    const [availability] = await this.namecheapService.checkAvailability([
      domainName,
    ]);
    if (!availability || !availability.available) {
      throw new ConflictException(
        'This domain is no longer available. Please search again.',
      );
    }

    const priceUsd = availability.isPremium
      ? (availability.premiumPriceUsd ?? 0)
      : await this.namecheapService.getPricing(tld);
    const rate = this.exchangeRate();

    return this.prisma.domainOrder.create({
      data: {
        userId,
        domainName,
        tld,
        years: dto.years ?? 1,
        priceUsd,
        priceBdt: Math.round(priceUsd * rate),
        exchangeRate: rate,
        registrantFirstName: dto.registrantFirstName,
        registrantLastName: dto.registrantLastName,
        registrantAddress1: dto.registrantAddress1,
        registrantAddress2: dto.registrantAddress2,
        registrantCity: dto.registrantCity,
        registrantStateProvince: dto.registrantStateProvince,
        registrantPostalCode: dto.registrantPostalCode,
        registrantCountry: dto.registrantCountry,
        registrantPhone: dto.registrantPhone,
        registrantEmail: dto.registrantEmail,
      },
    });
  }

  async listOrdersForUser(userId: string) {
    return this.prisma.domainOrder.findMany({
      where: { userId },
      // adminNote is deliberately excluded here — it's an internal note for
      // staff reviewing the order and must never reach the customer.
      select: {
        id: true,
        domainName: true,
        tld: true,
        years: true,
        priceUsd: true,
        priceBdt: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllOrders() {
    return this.prisma.domainOrder.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(id: string) {
    const order = await this.prisma.domainOrder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Domain order not found.');
    }

    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateDomainOrderStatusDto) {
    await this.getOrder(id);

    return this.prisma.domainOrder.update({
      where: { id },
      data: {
        status: dto.status,
        adminNote: dto.adminNote,
      },
    });
  }
}
