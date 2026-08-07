import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateMilestoneDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsIn(['PENDING', 'IN_PROGRESS', 'DONE'])
  status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
}
