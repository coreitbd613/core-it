import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  stateProvince?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  tradeLicense?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  tin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  bin?: string;

  @IsOptional()
  @IsString()
  whatsappBusiness?: string;

  @IsOptional()
  @IsUrl()
  facebookPage?: string;

  @IsOptional()
  @IsUrl()
  instagramPage?: string;

  @IsOptional()
  @IsUrl()
  linkedinPage?: string;
}
