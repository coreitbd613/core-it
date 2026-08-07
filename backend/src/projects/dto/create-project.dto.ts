import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateProjectCredentialDto } from './create-project-credential.dto';
import { CreateProjectMilestoneDto } from './create-project-milestone.dto';
import { CreateProjectTeamMemberDto } from './create-project-team-member.dto';

export class CreateProjectDto {
  @IsUUID()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Freeform — no real Proposal/Contract backend exists yet, mirrors Invoice.proposalId.
  @IsOptional()
  @IsString()
  proposalId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsDateString()
  startedAt: string;

  @IsOptional()
  @IsDateString()
  targetEndAt?: string;

  @IsOptional()
  @Min(0)
  includedRevisions?: number = 0;

  @IsOptional()
  @Min(0)
  supportMonths?: number = 0;

  @IsOptional()
  @IsString()
  projectType?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  projectManagerName?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  paymentSchedule?: string;

  @IsOptional()
  @Min(0)
  contractValueBdt?: number;

  @IsOptional()
  @IsDateString()
  goLiveAt?: string;

  @IsOptional()
  @Min(0)
  revisionWindowDays?: number;

  @IsOptional()
  @Min(0)
  maxDaysPerRevision?: number;

  @IsOptional()
  @Min(0)
  extraRevisionPriceBdt?: number;

  @IsOptional()
  @IsString()
  revisionNotes?: string;

  @IsOptional()
  @IsIn(['STANDARD', 'PRIORITY', 'PREMIUM'])
  supportSla?: 'STANDARD' | 'PRIORITY' | 'PREMIUM' = 'STANDARD';

  @IsOptional()
  @IsString()
  supportWorkingHours?: string;

  @IsOptional()
  @Min(0)
  includedSupportTickets?: number;

  @IsOptional()
  @IsString()
  supportContactName?: string;

  @IsOptional()
  @IsBoolean()
  sendRenewalReminder?: boolean = false;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  hostingProvider?: string;

  @IsOptional()
  @IsString()
  serverDetails?: string;

  @IsOptional()
  @IsString()
  repositoryUrl?: string;

  @IsOptional()
  @IsString()
  stagingUrl?: string;

  @IsOptional()
  @IsString()
  productionUrl?: string;

  @IsOptional()
  @IsString()
  techStack?: string;

  @IsOptional()
  @IsIn(['MANUAL', 'CI_CD', 'FTP', 'GIT_PUSH'])
  deploymentMethod?: 'MANUAL' | 'CI_CD' | 'FTP' | 'GIT_PUSH';

  @IsOptional()
  @IsString()
  credentialsNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectMilestoneDto)
  milestones?: CreateProjectMilestoneDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectTeamMemberDto)
  teamMembers?: CreateProjectTeamMemberDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectCredentialDto)
  credentials?: CreateProjectCredentialDto[];
}
