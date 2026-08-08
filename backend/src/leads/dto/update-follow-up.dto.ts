import { IsDateString, IsOptional } from 'class-validator';

export class UpdateFollowUpDto {
  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string | null;
}
