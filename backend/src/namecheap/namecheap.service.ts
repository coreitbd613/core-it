import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XMLParser } from 'fast-xml-parser';

export interface DomainAvailability {
  domain: string;
  available: boolean;
  isPremium: boolean;
  premiumPriceUsd?: number;
}

export interface DomainPricing {
  registrationUsd: number;
  renewalUsd: number;
}

const PRICING_CACHE_TTL_MS = 60 * 60 * 1000;
const ARRAY_TAGS = new Set([
  'DomainCheckResult',
  'ProductType',
  'ProductCategory',
  'Product',
  'Price',
  'Error',
]);

@Injectable()
export class NamecheapService {
  private readonly logger = new Logger(NamecheapService.name);
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (tagName) => ARRAY_TAGS.has(tagName),
  });
  private readonly pricingCache = new Map<
    string,
    { pricing: DomainPricing; expiresAt: number }
  >();

  constructor(private readonly configService: ConfigService) {}

  private baseParams(): URLSearchParams {
    const params = new URLSearchParams();
    params.set(
      'ApiUser',
      this.configService.getOrThrow<string>('NAMECHEAP_API_USER'),
    );
    params.set(
      'ApiKey',
      this.configService.getOrThrow<string>('NAMECHEAP_API_KEY'),
    );
    params.set(
      'UserName',
      this.configService.getOrThrow<string>('NAMECHEAP_USERNAME'),
    );
    params.set(
      'ClientIp',
      this.configService.getOrThrow<string>('NAMECHEAP_CLIENT_IP'),
    );
    return params;
  }

  private baseUrl(): string {
    return (
      this.configService.get<string>('NAMECHEAP_API_BASE_URL') ??
      'https://api.namecheap.com/xml.response'
    );
  }

  private async call(command: string, extraParams: Record<string, string>) {
    const params = this.baseParams();
    params.set('Command', command);
    for (const [key, value] of Object.entries(extraParams)) {
      params.set(key, value);
    }

    const res = await fetch(`${this.baseUrl()}?${params.toString()}`);
    const text = await res.text();
    const parsed = this.parser.parse(text) as {
      ApiResponse?: {
        '@_Status'?: string;
        Errors?: { Error?: { '#text'?: string }[] };
        CommandResponse?: Record<string, unknown>;
      };
    };

    const apiResponse = parsed.ApiResponse;
    if (!apiResponse || apiResponse['@_Status'] !== 'OK') {
      const errors = apiResponse?.Errors?.Error ?? [];
      const message =
        errors.map((error) => error['#text']).join('; ') ||
        'Namecheap API request failed';
      this.logger.error(`Namecheap ${command} failed: ${message}`);
      throw new InternalServerErrorException(
        'Domain lookup is temporarily unavailable.',
      );
    }

    return apiResponse.CommandResponse;
  }

  async checkAvailability(domains: string[]): Promise<DomainAvailability[]> {
    const commandResponse = await this.call('namecheap.domains.check', {
      DomainList: domains.join(','),
    });

    const results =
      (commandResponse?.DomainCheckResult as Record<string, string>[]) ?? [];

    return results.map((result) => ({
      domain: result['@_Domain'],
      available: result['@_Available'] === 'true',
      isPremium: result['@_IsPremiumName'] === 'true',
      premiumPriceUsd: result['@_PremiumRegistrationPrice']
        ? Number(result['@_PremiumRegistrationPrice'])
        : undefined,
    }));
  }

  private async getActionPrice(
    tld: string,
    productCategory: 'REGISTER' | 'RENEW',
    actionName: 'REGISTER' | 'RENEW',
  ): Promise<number> {
    const commandResponse = await this.call('namecheap.users.getPricing', {
      ProductType: 'DOMAIN',
      ProductCategory: productCategory,
      ActionName: actionName,
      ProductName: tld,
    });

    const productTypes =
      (
        commandResponse?.UserGetPricingResult as {
          ProductType?: Record<string, unknown>[];
        }
      )?.ProductType ?? [];
    const categories = (productTypes[0]?.ProductCategory ?? []) as Record<
      string,
      unknown
    >[];
    const products = (categories[0]?.Product ?? []) as Record<
      string,
      unknown
    >[];
    const prices = (products[0]?.Price ?? []) as Record<string, string>[];
    const yearPrice = prices.find((price) => price['@_Duration'] === '1');

    if (!yearPrice) {
      throw new InternalServerErrorException(`No pricing found for .${tld}`);
    }

    return Number(
      yearPrice['@_YourPrice'] ??
        yearPrice['@_RegularPrice'] ??
        yearPrice['@_Price'],
    );
  }

  async getPricing(tld: string): Promise<DomainPricing> {
    const normalized = tld.toLowerCase();
    const cached = this.pricingCache.get(normalized);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.pricing;
    }

    const pricing = {
      registrationUsd: await this.getActionPrice(
        normalized,
        'REGISTER',
        'REGISTER',
      ),
      renewalUsd: await this.getActionPrice(normalized, 'RENEW', 'RENEW'),
    };
    this.pricingCache.set(normalized, {
      pricing,
      expiresAt: Date.now() + PRICING_CACHE_TTL_MS,
    });

    return pricing;
  }
}
