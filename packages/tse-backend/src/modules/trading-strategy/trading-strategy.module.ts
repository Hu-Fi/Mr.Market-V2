import { Module } from '@nestjs/common';
import { TradingStrategyService } from './trading-strategy.service';
import { ArbitrageStrategy } from './strategies/arbitrage/arbitrage.strategy';
import { TradingStrategyController } from './trading-strategy.controller';
import { StrategyExecutorService } from './strategy-executor.service';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { ExchangeTradeService } from '../exchange-trade/exchange-trade.service';
import { ExchangeOperationModule } from '../exchange-operation/exchange-operation.module';
import { TradingStrategyProfile } from './trading-strategy.mapper';

@Module({
  imports: [ExchangeRegistryModule, ExchangeOperationModule],
  providers: [
    TradingStrategyService,
    StrategyExecutorService,
    ArbitrageStrategy,
    ExchangeTradeService,
    TradingStrategyProfile,
  ],
  exports: [TradingStrategyService],
  controllers: [TradingStrategyController],
})
export class TradingStrategyModule {}
