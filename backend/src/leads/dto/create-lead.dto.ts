import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const LEAD_SOURCES = [
  'FACEBOOK_ADS',
  'WHATSAPP',
  'WEBSITE',
  'REFERRAL',
  'COLD_OUTREACH',
  'SOCIAL_MEDIA',
  'EVENT',
  'OTHER',
] as const;

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsIn(LEAD_SOURCES)
  source: (typeof LEAD_SOURCES)[number];

  @IsOptional()
  @IsString()
  sourceDetail?: string;

  @IsOptional()
  @Min(0)
  estimatedValueBdt?: number;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Not a Lead column — the service logs this as the lead's first activity.
  @IsOptional()
  @IsString()
  initialNote?: string;
}
