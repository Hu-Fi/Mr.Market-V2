import { Module } from '@nestjs/common';
import { TradingHistoryService } from './trading-history.service';
import { TradingHistoryController } from './trading-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../common/entities/order.entity';
import { OrderRepository } from '../exchange-operation/order.repository';
import { TradingHistoryProfile } from './trading-history.mapper';
import { MarketMakingRepository } from '../trading-strategy/strategies/market-making/market-making.repository';
import { MarketMaking } from '../../common/entities/market-making.entity';
import { ArbitrageStrategyRepository } from '../trading-strategy/strategies/arbitrage/arbitrage.repository';
import { Arbitrage } from '../../common/entities/arbitrage.entity';
import { VolumeStrategyRepository } from '../trading-strategy/strategies/volume/volume.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Order, MarketMaking, Arbitrage])],
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
