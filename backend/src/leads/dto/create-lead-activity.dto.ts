import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLeadActivityDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
