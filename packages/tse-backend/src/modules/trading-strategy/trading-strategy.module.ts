import { Module } from '@nestjs/common';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { ExchangeTradeService } from '../exchange-trade/exchange-trade.service';
import { ExchangeOperationModule } from '../exchange-operation/exchange-operation.module';
import { ArbitrageController } from './strategies/arbitrage/arbitrage.controller';
import { ArbitrageStrategyProfile } from './strategies/arbitrage/arbitrage.mapper';
import { ArbitrageStrategyRepository } from './strategies/arbitrage/arbitrage.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StrategyArbitrage } from '../../common/entities/startegy-arbitrage.entity';
import { ArbitrageService } from './strategies/arbitrage/arbitrage.service';
import { ArbitrageStrategy } from './strategies/arbitrage/arbitrage.strategy';
import { StrategyMarketMaking } from '../../common/entities/strategy-market-making.entity';
import { MarketMakingStrategy } from './strategies/market-making/market-making.strategy';
import { MarketMakingService } from './strategies/market-making/market-making.service';
import { MarketMakingRepository } from './strategies/market-making/market-making.repository';
import { MarketMakingStrategyProfile } from './strategies/market-making/market-making.mapper';
import { MarketMakingController } from './strategies/market-making/market-making.controller';
import { ExchangeDataModule } from '../exchange-data/exchange-data.module';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { VolumeController } from './strategies/volume/volume.controller';
import { VolumeStrategy } from './strategies/volume/volume.strategy';
import { VolumeService } from './strategies/volume/volume.service';
import { VolumeStrategyRepository } from './strategies/volume/volume.repository';
import { VolumeStrategyProfile } from './strategies/volume/volume.mapper';
import { StrategyVolume } from '../../common/entities/strategy-volume.entity';
import { GetAdditionalAccountStrategy } from '../exchange-registry/exchange-manager/strategies/get-additional-account.strategy';
import { GetDefaultAccountStrategy } from '../exchange-registry/exchange-manager/strategies/get-default-account.strategy';
import { GetAllDefaultAccountsStrategy } from '../exchange-registry/exchange-manager/strategies/get-all-default-accounts.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StrategyArbitrage,
      StrategyMarketMaking,
      StrategyVolume,
    ]),
    ExchangeRegistryModule,
    ExchangeOperationModule,
    ExchangeDataModule,
    IntegrationsModule,
  ],
  providers: [
    ArbitrageStrategy,
    MarketMakingStrategy,
    VolumeStrategy,
    ArbitrageService,
    MarketMakingService,
    VolumeService,
    ArbitrageStrategyRepository,
    MarketMakingRepository,
    VolumeStrategyRepository,
    ExchangeTradeService,
    MarketMakingStrategyProfile,
    ArbitrageStrategyProfile,
    VolumeStrategyProfile,
    GetDefaultAccountStrategy,
    GetAdditionalAccountStrategy,
    GetAllDefaultAccountsStrategy,
  ],
  exports: [
    ArbitrageStrategy,
    ArbitrageService,
    MarketMakingStrategy,
    MarketMakingService,
    VolumeStrategy,
    VolumeService,
  ],
  controllers: [ArbitrageController, MarketMakingController, VolumeController],
})
export class TradingStrategyModule {}
