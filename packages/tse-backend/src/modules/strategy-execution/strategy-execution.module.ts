import { Module } from '@nestjs/common';
import { ExecutionWorkerService } from './execution-worker.service';
import { TradingStrategyModule } from '../trading-strategy/trading-strategy.module';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TradingStrategyModule],
  providers: [ExecutionWorkerService, ConfigService, SchedulerUtil],
})
export class StrategyExecutionModule {}
