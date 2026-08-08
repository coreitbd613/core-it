import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
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

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  companyName?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsIn(LEAD_SOURCES)
  source?: (typeof LEAD_SOURCES)[number];

  @IsOptional()
  @IsString()
  sourceDetail?: string | null;

  @IsOptional()
  @Min(0)
  estimatedValueBdt?: number | null;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string | null;

  @IsOptional()
  @IsString()
  industry?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
