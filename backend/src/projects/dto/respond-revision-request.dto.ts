import { IsIn } from 'class-validator';

export class RespondRevisionRequestDto {
  @IsIn(['OPEN', 'IN_PROGRESS', 'DONE'])
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
}
