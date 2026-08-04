import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateInvoiceLineItemDto } from './create-invoice-line-item.dto';

export class CreateInvoiceDto {
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsString()
  proposalId?: string;

  @IsDateString()
  dueAt: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineItemDto)
  lineItems: CreateInvoiceLineItemDto[];

  @IsOptional()
  @Min(0)
  @Max(100)
  taxPercent?: number = 0;

  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number = 0;

  @IsOptional()
  @IsString()
  notes?: string;

  // Admin can create straight into SENT ("Send to company") or leave as DRAFT.
  @IsOptional()
  @IsIn(['DRAFT', 'SENT'])
  status?: 'DRAFT' | 'SENT' = 'DRAFT';
}
