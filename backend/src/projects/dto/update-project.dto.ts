import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  proposalId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  targetEndAt?: string;

  @IsOptional()
  @Min(0)
  includedRevisions?: number;

  @IsOptional()
  @Min(0)
  supportMonths?: number;

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
  supportSla?: 'STANDARD' | 'PRIORITY' | 'PREMIUM';

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
  sendRenewalReminder?: boolean;

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
}
