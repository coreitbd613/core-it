import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DomainOrderStatus } from '../../../generated/prisma/client';

export class UpdateDomainOrderStatusDto {
  @IsEnum(DomainOrderStatus)
  status: DomainOrderStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
