import { DeleteResult, FindManyOptions, LessThan, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../../common/entities/order.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  async create(transactionData: Partial<Order>): Promise<Order> {
    return this.repository.save(transactionData);
  }

  async findById(id: number, options?: any) {
    return await this.repository.findOne({ where: { id, ...options } });
  }

  async findByOrderExtId(orderId: string, options?: any) {
    return await this.repository.findOne({
      where: { orderExtId: orderId, ...options },
    });
  }

  async save(data: Partial<Order>) {
    return await this.repository.save(data);
  }

  async find(query: FindManyOptions) {
    return await this.repository.find(query);
  }

  async delete(dateThreshold: Date): Promise<DeleteResult> {
    return await this.repository.delete({
      createdAt: LessThan(dateThreshold),
    });
  }
}
