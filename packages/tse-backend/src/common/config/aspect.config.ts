import { Injectable, OnModuleInit } from '@nestjs/common';
import { addAspectToPointcut, Advice } from 'ts-aspect';
import { DatabaseCacheUtil } from '../utils/aspect/database/database.cache.util';
import { OrderRepository } from '../../modules/exchange-operation/order.repository';
import { OperationRepository } from '../../modules/exchange-operation/operation.repository';

@Injectable()
export class AspectConfig implements OnModuleInit  {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly operationRepository: OperationRepository,
    private readonly databaseCacheUtil: DatabaseCacheUtil
  ) {}
  onModuleInit () {
    addAspectToPointcut(this.orderRepository, '.*', Advice.After, this.databaseCacheUtil);
    addAspectToPointcut(this.operationRepository, '.*', Advice.After, this.databaseCacheUtil);
  }
}
