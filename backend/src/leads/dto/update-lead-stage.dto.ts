import { IsIn, IsOptional, IsString } from 'class-validator';

const LEAD_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'] as const;

export class UpdateLeadStageDto {
  @IsIn(LEAD_STAGES)
  stage: (typeof LEAD_STAGES)[number];

  @IsOptional()
  @IsString()
  lostReason?: string;
}
