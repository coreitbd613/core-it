import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export class CreateHostingOrderDto {
  @IsString()
  @IsNotEmpty()
  planSlug: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(PHONE_REGEX, { message: 'Enter a valid phone number' })
  phone: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
