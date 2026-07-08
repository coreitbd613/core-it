import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'Enter a valid phone number' })
  contactNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'Enter a valid phone number' })
  whatsappNumber?: string;
}
