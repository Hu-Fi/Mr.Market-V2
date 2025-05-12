import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebSchedulerService } from './web-scheduler.service';

@ApiTags('web-scheduler')
@Controller('cron')
export class WebSchedulerController {
  constructor(private readonly service: WebSchedulerService) {}

  @Get('transaction/execute')
  @ApiOperation({
    summary:
      'Trigger the cron job for Mixin deposit and withdrawal transactions',
  })
  async triggerTransactionCronJob() {
    await this.service.triggerTransactionCronJob();
  }
}
