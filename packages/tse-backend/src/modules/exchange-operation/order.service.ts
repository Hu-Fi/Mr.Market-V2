import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { Order } from '../../common/entities/order.entity';
import {
  CancelOperationCommand,
  OperationCommand,
} from './model/exchange-operation.model';
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

  async persistOrderActivity(command: OperationCommand): Promise<void> {
    const { status, orderExtId, details } = command;
    const order =
      command instanceof CancelOperationCommand
        ? await this.repository.findByOrderExtId(orderExtId)
        : await this.repository.findById(command.orderEntityId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.orderExtId && orderExtId) {
      order.orderExtId = orderExtId;
    }

    order.status = status;
    const persistedOrder = await this.repository.save(order);

    await this.operationService.persistOperationData(persistedOrder, {
      status,
      details,
    });
  }

  async deleteOlderOrders(numberOfDays: number): Promise<number> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - numberOfDays);

    const deleteResult = await this.repository.delete(dateThreshold);

    return deleteResult.affected || 0;
  }

  async getOrderByExtId(
    orderExtId: string,
    user: { userId: string; clientId: string },
  ) {
    return await this.repository.findByOrderExtId(orderExtId, {
      userId: user.userId,
      clientId: user.clientId,
    });
  }
}
