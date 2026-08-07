import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectMilestoneDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
