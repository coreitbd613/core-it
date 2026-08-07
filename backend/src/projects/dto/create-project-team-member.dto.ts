import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsIn(['FULL', 'EDIT', 'VIEW'])
  accessLevel?: 'FULL' | 'EDIT' | 'VIEW' = 'VIEW';
}
