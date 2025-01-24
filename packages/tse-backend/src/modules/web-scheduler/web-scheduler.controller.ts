import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebSchedulerService } from './web-scheduler.service';

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
  async triggerCampaignCronJob() {
    await this.service.triggerCampaignCronJob();
  }
}
