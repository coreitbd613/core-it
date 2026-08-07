import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRevisionRequestDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  // Only used on the admin route (filing on a client's behalf). The
  // client-facing "mine" route derives this from the authenticated user.
  @IsOptional()
  @IsString()
  requestedBy?: string;
}
