import { Module } from '@nestjs/common';
import { TradingHistoryService } from './trading-history.service';
import { TradingHistoryController } from './trading-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeOrder } from '../../common/entities/trade-order.entity';
import { OrderRepository } from '../exchange-operation/order.repository';
import { TradingHistoryProfile } from './trading-history.mapper';
import { MarketMakingRepository } from '../trading-strategy/strategies/market-making/market-making.repository';
import { StrategyMarketMaking } from '../../common/entities/strategy-market-making.entity';
import { ArbitrageStrategyRepository } from '../trading-strategy/strategies/arbitrage/arbitrage.repository';
import { StrategyArbitrage } from '../../common/entities/startegy-arbitrage.entity';
import { VolumeStrategyRepository } from '../trading-strategy/strategies/volume/volume.repository';
import { StrategyVolume } from '../../common/entities/strategy-volume.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TradeOrder,
      StrategyMarketMaking,
      StrategyArbitrage,
      StrategyVolume,
    ]),
  ],
  providers: [
    TradingHistoryService,
    TradingHistoryProfile,
    OrderRepository,
    MarketMakingRepository,
    ArbitrageStrategyRepository,
    VolumeStrategyRepository,
  ],
  controllers: [TradingHistoryController],
})
export class TradingHistoryModule {}
