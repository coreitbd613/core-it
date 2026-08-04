import {
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInvoiceLineItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  quantity?: string;

  @IsNumber()
  @Min(0)
  unitPriceBdt: number;
}
