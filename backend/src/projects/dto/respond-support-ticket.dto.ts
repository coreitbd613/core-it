import { IsIn } from 'class-validator';

export class RespondSupportTicketDto {
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED'])
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}
