import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateProjectTeamMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsIn(['FULL', 'EDIT', 'VIEW'])
  accessLevel?: 'FULL' | 'EDIT' | 'VIEW';
}
