import { Module } from '@nestjs/common';
import { ExchangeOperationService } from './exchange-operation.service';
import { ExchangeOperationRepository } from './exchange-operation.repository';
import { Operation } from '../../common/entities/operation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../common/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Operation])],
  providers: [ExchangeOperationService, ExchangeOperationRepository],
  exports: [ExchangeOperationService, ExchangeOperationRepository],
})
export class ExchangeOperationModule {}
