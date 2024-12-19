import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebSchedulerService } from './web-scheduler.service';
import { CronSecretGuard } from '../../common/utils/auth/guards/cron-secret.guard';

@ApiTags('web-scheduler')
@Controller('cron')
export class WebSchedulerController {
  constructor(private readonly service: WebSchedulerService) {}

  @Get('strategy/execute')
  @ApiOperation({ summary: 'Trigger strategy cron job' })
  @UseGuards(CronSecretGuard)
  async triggerStrategyCronJob() {
    await this.service.triggerStrategyCronJob();
  }
}
