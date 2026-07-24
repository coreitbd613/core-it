import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export class CreateDomainOrderDto {
  @IsString()
  @IsNotEmpty()
  domainName: string;

  @IsString()
  @IsNotEmpty()
  tld: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  years?: number = 1;

  @IsString()
  @IsNotEmpty()
  registrantFirstName: string;

  @IsString()
  @IsNotEmpty()
  registrantLastName: string;

  @IsString()
  @IsNotEmpty()
  registrantAddress1: string;

  @IsOptional()
  @IsString()
  registrantAddress2?: string;

  @IsString()
  @IsNotEmpty()
  registrantCity: string;

  @IsString()
  @IsNotEmpty()
  registrantStateProvince: string;

  @IsString()
  @IsNotEmpty()
  registrantCountry: string;

  @IsString()
  @Matches(PHONE_REGEX, { message: 'Enter a valid phone number' })
  registrantPhone: string;

  @IsEmail()
  registrantEmail: string;
}
