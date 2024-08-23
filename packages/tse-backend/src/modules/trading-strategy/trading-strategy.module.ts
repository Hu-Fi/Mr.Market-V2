import { Module } from '@nestjs/common';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { ExchangeTradeService } from '../exchange-trade/exchange-trade.service';
import { ExchangeOperationModule } from '../exchange-operation/exchange-operation.module';
import { ArbitrageController } from './strategies/arbitrage/arbitrage.controller';
import { ArbitrageStrategyProfile } from './strategies/arbitrage/arbitrage.mapper';
import { ArbitrageStrategyRepository } from './strategies/arbitrage/arbitrage.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arbitrage } from '../../common/entities/arbitrage.entity';
import { ArbitrageService } from './strategies/arbitrage/arbitrage.service';
import { ArbitrageStrategy } from './strategies/arbitrage/arbitrage.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Arbitrage]),
    ExchangeRegistryModule,
    ExchangeOperationModule,
  ],
  providers: [
    ArbitrageStrategy,
    ArbitrageService,
    ExchangeTradeService,
    ArbitrageStrategyRepository,
    ArbitrageStrategyProfile,
  ],
  exports: [ArbitrageStrategy],
  controllers: [ArbitrageController],
})
export class TradingStrategyModule {}
