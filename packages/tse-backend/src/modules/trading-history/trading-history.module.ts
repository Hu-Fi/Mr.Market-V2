import { Module } from '@nestjs/common';
import { TradingHistoryService } from './trading-history.service';
import { TradingHistoryController } from './trading-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../common/entities/order.entity';
import { OrderRepository } from '../exchange-operation/order.repository';
import { TradingHistoryProfile } from './trading-history.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [TradingHistoryService, OrderRepository, TradingHistoryProfile],
  controllers: [TradingHistoryController]
})
export class TradingHistoryModule {}
