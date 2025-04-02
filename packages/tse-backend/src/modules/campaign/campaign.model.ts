import { ApiProperty } from '@nestjs/swagger';

class CampaignError {
  @ApiProperty({ description: 'Address of the campaign' })
  campaignAddress: string;

  @ApiProperty({ description: 'Error message' })
  error: string;
}

export class JoinCampaignResultDto {
  @ApiProperty({ description: 'Successfully joined campaign addresses', example: ['0x123...', '0x456...'] })
  successful: string[];

  @ApiProperty({ description: 'Campaign addresses already registered', example: ['0x789...'] })
  alreadyRegistered: string[];

  @ApiProperty({ description: 'List of errors', type: [CampaignError] })
  errors: CampaignError[];
}