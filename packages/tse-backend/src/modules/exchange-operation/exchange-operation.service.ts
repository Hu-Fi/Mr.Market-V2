import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateLimitOrderCommand,
  OperationCommand,
  OrderCommand,
} from './model/exchange-operation.model';
import { CustomLogger } from '../logger/logger.service';
import { OrderStatus } from '../../common/enums/exchange-operation.enums';
import { Order } from '../../common/entities/order.entity';
import { OrderService } from './order.service';

@Injectable()
export class ExchangeOperationService {
  private readonly logger = new CustomLogger(ExchangeOperationService.name);

  constructor(private readonly orderService: OrderService) {}

  async saveOrderData(command: OrderCommand): Promise<Order> {
    const { orderType, userId, clientId, exchangeName, symbol, side, amount } =
      command;

    const price = (command as CreateLimitOrderCommand).price ?? null;

    try {
      return await this.orderService.createOrder({
        userId,
        clientId,
        exchangeName,
        symbol,
        type: orderType,
        side,
        amount,
        status: OrderStatus.PENDING,
        price,
        orderExtId: null,
      });
    } catch (error) {
      this.logger.error(`Failed to save draft order: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to save draft order: ${error.message}`,
      );
    }
  }

  async saveExchangeOperation(command: OperationCommand) {
    try {
      await this.orderService.persistOrderActivity(command);
    } catch (error) {
      this.logger.error(`Failed to save exchange operation: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to save exchange operation: ${error.message}`,
      );
    }
  }

  async getExchangeOperation(
    orderExtId: string,
    user: { userId: string; clientId: string },
  ) {
    try {
      return await this.orderService.getOrderByExtId(orderExtId, user);
    } catch (error) {
      this.logger.error(`Failed to get exchange operation: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to get exchange operation: ${error.message}`,
      );
    }
  }
}
