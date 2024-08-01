import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../../common/entities/order.entity';
import { Operation } from '../../common/entities/operation.entity';

@Injectable()
export class ExchangeOperationRepository {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
  ) {}

  async findOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({ where: { userId } });
  }

  async findOrdersByClient(clientId: string): Promise<Order[]> {
    return this.orderRepository.find({ where: { clientId } });
  }

  async createOrder(transactionData: Partial<Order>): Promise<Order> {
    const transaction = this.orderRepository.create(transactionData);
    return this.orderRepository.save(transaction);
  }

  async updateOrderId(id: number, orderId: string): Promise<void> {
    await this.orderRepository.update({ id }, { orderId });
  }

  async updateOrderStatus(
    id: number,
    status: string,
    details: Record<string, any>,
  ): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    await this.orderRepository.save(order);

    const operation = this.operationRepository.create({
      status,
      details,
      order,
    });
    await this.operationRepository.save(operation);
  }
}
