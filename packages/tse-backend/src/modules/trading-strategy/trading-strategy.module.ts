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
import { MarketMaking } from '../../common/entities/market-making.entity';
import { MarketMakingStrategy } from './strategies/market-making/market-making.strategy';
import { MarketMakingService } from './strategies/market-making/market-making.service';
import { MarketMakingRepository } from './strategies/market-making/market-making.repository';
import { MarketMakingStrategyProfile } from './strategies/market-making/market-making.mapper';
import { MarketMakingController } from './strategies/market-making/market-making.controller';
import { ExchangeDataModule } from '../exchange-data/exchange-data.module';
import { IntegrationsModule } from '../../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Arbitrage, MarketMaking]),
    ExchangeRegistryModule,
    ExchangeOperationModule,
    ExchangeDataModule,
    IntegrationsModule,
  ],
  providers: [
    ArbitrageStrategy,
    MarketMakingStrategy,
    ArbitrageService,
    MarketMakingService,
    ArbitrageStrategyRepository,
    MarketMakingRepository,
    ExchangeTradeService,
    MarketMakingStrategyProfile,
    ArbitrageStrategyProfile,
  ],
  exports: [
    ArbitrageStrategy,
    ArbitrageService,
    MarketMakingStrategy,
    MarketMakingService,
  ],
  controllers: [ArbitrageController, MarketMakingController],
})
export class TradingStrategyModule {}
