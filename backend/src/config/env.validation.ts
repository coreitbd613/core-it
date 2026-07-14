import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsNumberString()
  @IsOptional()
  PORT?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN?: string;

  // Left optional on purpose: the app must still boot (and email/password
  // auth must still work) before real Google OAuth credentials are filled
  // in. GoogleStrategy falls back to placeholder values when these are unset.
  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN?: string;

  @IsString()
  @IsNotEmpty()
  AZURE_STORAGE_CONNECTION_STRING: string;

  @IsString()
  @IsNotEmpty()
  AZURE_STORAGE_CONTAINER: string;

  // Optional at boot so the app still starts before real Namecheap
  // credentials are filled in; NamecheapService throws when actually
  // called if these are missing.
  @IsString()
  @IsOptional()
  NAMECHEAP_API_USER?: string;

  @IsString()
  @IsOptional()
  NAMECHEAP_API_KEY?: string;

  @IsString()
  @IsOptional()
  NAMECHEAP_USERNAME?: string;

  @IsString()
  @IsOptional()
  NAMECHEAP_CLIENT_IP?: string;

  @IsString()
  @IsOptional()
  NAMECHEAP_API_BASE_URL?: string;

  @IsNumberString()
  @IsOptional()
  USD_TO_BDT_RATE?: string;

  // Optional at boot so the app still starts before a real Resend key is
  // filled in; MailService throws if actually called without one.
  @IsString()
  @IsOptional()
  RESEND_API_KEY?: string;

  @IsString()
  @IsOptional()
  MAIL_FROM?: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validated;
}
