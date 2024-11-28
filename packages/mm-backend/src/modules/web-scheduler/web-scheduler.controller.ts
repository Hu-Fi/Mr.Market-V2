import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebSchedulerService } from './web-scheduler.service';
import { CronSecretGuard } from '../../common/utils/auth/guards/cron-secret.guard';

@ApiTags('web-scheduler')
@Controller('cron')
export class WebSchedulerController {
  constructor(
    private readonly service: WebSchedulerService
  ) {}

  @Get('transaction/execute')
  @ApiOperation({ summary: 'Trigger transaction cron job' })
  @UseGuards(CronSecretGuard)
  async triggerTransactionCronJob() {
    await this.service.triggerTransactionCronJob();
  }
}
