import { Injectable } from '@nestjs/common';
import { OperationRepository } from './operation.repository';
import { Order } from '../../common/entities/order.entity';
import {
  PersistOperationDto,
  CreateOperationDto,
} from '../../common/interfaces/exchange-operation.interfaces';

@Injectable()
export class OperationService {
  constructor(private repository: OperationRepository) {}

  async persistOperationData(order: Order, data: PersistOperationDto) {
    await this.repository.create({
      status: data.status,
      details: data.details,
      order,
    } as CreateOperationDto);
  }
}
