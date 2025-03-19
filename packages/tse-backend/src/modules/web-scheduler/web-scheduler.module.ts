import { Module } from '@nestjs/common';
import { WebSchedulerService } from './web-scheduler.service';
import { WebSchedulerController } from './web-scheduler.controller';
import { StrategyExecutionModule } from '../strategy-execution/strategy-execution.module';
import { CampaignModule } from '../campaign/campaign.module';
import { ExchangeOperationModule } from '../exchange-operation/exchange-operation.module';

@Module({
  imports: [StrategyExecutionModule, CampaignModule, ExchangeOperationModule],
  providers: [WebSchedulerService],
  controllers: [WebSchedulerController],
})
export class WebSchedulerModule {}
