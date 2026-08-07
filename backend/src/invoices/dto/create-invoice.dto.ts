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
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateInvoiceLineItemDto } from './create-invoice-line-item.dto';

export class CreateInvoiceDto {
  // Custom invoice number. When omitted, the service auto-generates one
  // (INV-{year}-{seq}) via nextInvoiceNumber.
  @IsOptional()
  @IsString()
  @MaxLength(50)
  number?: string;

  // Exactly one of organizationId / customerName must be set — checked in
  // the service, since it's a cross-field rule class-validator can't express cleanly.
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerName?: string;

  // Optional company name to display alongside customerName (adhoc mode only).
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerCompanyName?: string;

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

  // Exactly one of discountPercent / discountFlatBdt applies, per discountType.
  @IsOptional()
  @IsIn(['PERCENT', 'FLAT'])
  discountType?: 'PERCENT' | 'FLAT' = 'PERCENT';

  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number = 0;

  @IsOptional()
  @Min(0)
  discountFlatBdt?: number = 0;

  @IsOptional()
  @IsString()
  notes?: string;

  // Admin can create straight into SENT ("Send to company") or leave as DRAFT.
  @IsOptional()
  @IsIn(['DRAFT', 'SENT'])
  status?: 'DRAFT' | 'SENT' = 'DRAFT';
}
