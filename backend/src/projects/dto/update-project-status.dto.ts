import { IsIn } from 'class-validator';

export class UpdateProjectStatusDto {
  @IsIn(['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'])
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
}
