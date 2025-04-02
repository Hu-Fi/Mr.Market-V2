import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WebSchedulerService } from './web-scheduler.service';
import { JoinCampaignResultDto } from '../campaign/campaign.model';

@ApiTags('web-scheduler')
@Controller('cron')
export class WebSchedulerController {
  constructor(private readonly service: WebSchedulerService) {}

  @Get('strategy/execute')
  @ApiOperation({ summary: 'Trigger strategy cron job' })
  async triggerStrategyCronJob() {
    await this.service.triggerStrategyCronJob();
  }

  @Get('campaign/execute')
  @ApiOperation({ summary: 'Trigger campaign cron job' })
  @ApiResponse({ status: 200, description: 'Campaign execution result', type: JoinCampaignResultDto })
  async triggerCampaignCronJob() {
    return await this.service.triggerCampaignCronJob();
  }

  @Get('order-clear/execute')
  @ApiOperation({ summary: 'Clear old orders and operations' })
  async clearOldOrdersAndOperations() {
    return await this.service.clearOldOrdersAndOperations();
  }
}
