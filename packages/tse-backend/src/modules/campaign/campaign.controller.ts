import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';

@ApiTags('campaign contribution')
@UsePipes(new ValidationPipe())
@Controller('campaign')
export class CampaignController {
  constructor(
    private readonly service: CampaignService,
  ) {}

  @Get('/contribution') async getCampaignContribution() {
    return await this.service.getCampaignContribution();
  }
}
