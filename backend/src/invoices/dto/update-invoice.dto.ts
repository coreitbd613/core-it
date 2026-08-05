import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateInvoiceLineItemDto } from './create-invoice-line-item.dto';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineItemDto)
  lineItems?: CreateInvoiceLineItemDto[];

  @IsOptional()
  @Min(0)
  @Max(100)
  taxPercent?: number;

  @IsOptional()
  @IsIn(['PERCENT', 'FLAT'])
  discountType?: 'PERCENT' | 'FLAT';

  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @Min(0)
  discountFlatBdt?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
