import { Module } from '@nestjs/common';
import { TradingStrategyService } from './trading-strategy.service';

@Module({
  providers: [TradingStrategyService],
})
export class TradingStrategyModule {}
