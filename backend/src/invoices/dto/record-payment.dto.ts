import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../../generated/prisma/client';

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amountBdt: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;

  // Defaults to now on the server when omitted — lets the admin backdate a
  // payment that was actually received earlier (e.g. logged late).
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  transactionId?: string;
}
