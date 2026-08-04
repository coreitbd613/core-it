import { IsNotEmpty, IsString } from 'class-validator';

export class VoidInvoiceDto {
  @IsString()
  @IsNotEmpty()
  voidReason: string;
}
