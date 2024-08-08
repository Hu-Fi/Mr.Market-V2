import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { Order } from '../../common/entities/order.entity';
import { ExchangeOperationCommand } from './model/exchange-operation.model';
import { OperationService } from './operation.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly operationService: OperationService,
  ) {}

  async createOrder(data: Partial<Order>) {
    return await this.repository.create(data);
  }

  async persistOrderActivity(command: ExchangeOperationCommand): Promise<void> {
    const { orderEntityId, status, orderId, details } = command;
    const order = await this.repository.findById(orderEntityId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.orderId && orderId) {
      order.orderId = orderId;
    }

    order.status = status;
    const persistedOrder = await this.repository.save(order);

    await this.operationService.persistOperationData(persistedOrder, {
      status,
      details,
    });
  }
}
