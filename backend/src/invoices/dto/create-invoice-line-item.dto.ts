import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateInvoiceLineItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPriceBdt: number;
}
