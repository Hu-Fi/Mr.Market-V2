import { Module } from '@nestjs/common';
import { ExchangeOperationService } from './exchange-operation.service';
import { OperationRepository } from './operation.repository';
import { Operation } from '../../common/entities/operation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../common/entities/order.entity';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';
import { OperationService } from './operation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Operation])],
  providers: [
    ExchangeOperationService,
    OrderService,
    OperationService,
    OrderRepository,
    OperationRepository,
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
