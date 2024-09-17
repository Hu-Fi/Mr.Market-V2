import { Module } from '@nestjs/common';
import { ExchangeOperationService } from './exchange-operation.service';
import { OperationRepository } from './operation.repository';
import { Operation } from '../../common/entities/operation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../common/entities/order.entity';
import { OrderRepository } from './order.repository';
import { OrderService } from './order.service';
import { OperationService } from './operation.service';
import { AspectConfig } from '../../common/config/aspect.config';
import { AspectModule } from '../../common/utils/aspect/aspect.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Operation]),
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
