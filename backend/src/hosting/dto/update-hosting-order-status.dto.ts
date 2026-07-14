import { IsEnum, IsOptional, IsString } from 'class-validator';
import { HostingOrderStatus } from '../../../generated/prisma/client';

export class UpdateHostingOrderStatusDto {
  @IsEnum(HostingOrderStatus)
  status: HostingOrderStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
