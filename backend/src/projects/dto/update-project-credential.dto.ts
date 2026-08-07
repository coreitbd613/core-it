import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectCredentialDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
