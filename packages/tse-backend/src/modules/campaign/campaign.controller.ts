import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';

@ApiTags('campaign contribution')
@UsePipes(new ValidationPipe())
@Controller('campaign')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CampaignController {
  constructor(private readonly service: CampaignService) {}

  @Get('/contribution') async getCampaignContribution() {
    return await this.service.getCampaignContribution();
  }
}
