import { Module } from '@nestjs/common';
import { ExchangeOperationService } from './exchange-operation.service';
import { OperationRepository } from './operation.repository';
import { TradeOperation } from '../../common/entities/trade-operation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeOrder } from '../../common/entities/trade-order.entity';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';
import { OperationService } from './operation.service';
import { AspectConfig } from '../../common/config/aspect.config';
import { AspectModule } from '../../common/utils/aspect/aspect.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TradeOrder, TradeOperation]),
    AspectModule,
  ],
  providers: [
    ExchangeOperationService,
    OrderService,
    OperationService,
    OrderRepository,
    OperationRepository,
    AspectConfig,
  ],
  exports: [
    ExchangeOperationService,
    OrderService,
    OperationService,
    OrderRepository,
    OperationRepository,
  ],
})
export class ExchangeOperationModule {}
