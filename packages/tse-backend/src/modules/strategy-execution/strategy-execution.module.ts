import { Module } from '@nestjs/common';
import { ExecutionWorkerService } from './execution-worker.service';
import { TradingStrategyModule } from '../trading-strategy/trading-strategy.module';

@Module({
  imports: [TradingStrategyModule],
  providers: [ExecutionWorkerService]
})
export class StrategyExecutionModule {}
