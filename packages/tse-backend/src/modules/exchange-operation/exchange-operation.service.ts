import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateLimitOrderCommand,
  ExchangeOperationCommand,
  OrderCommand,
} from './model/exchange-operation.model';
import { CustomLogger } from '../logger/logger.service';
import { ExchangeOperationRepository } from './exchange-operation.repository';
import { OrderStatus } from '../../common/enums/exchange-operation.enums';
import { Order } from '../../common/entities/order.entity';

@Injectable()
export class ExchangeOperationService {
  private readonly logger = new CustomLogger(ExchangeOperationService.name);

  constructor(private repository: ExchangeOperationRepository) {}

  async saveOrderData(command: OrderCommand): Promise<Order> {
    const { orderType, userId, clientId, exchangeName, symbol, side, amount } =
      command;

    const price = (command as CreateLimitOrderCommand).price ?? null;

    try {
      return await this.repository.createOrder({
        userId,
        clientId,
        exchangeName,
        symbol,
        type: orderType,
        side: side,
        amount,
        status: OrderStatus.PENDING,
        price,
        orderId: null,
      });
    } catch (error) {
      this.logger.error(`Failed to save draft order: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to save draft order: ${error.message}`,
      );
    }
  }

  async saveExchangeOperation(command: ExchangeOperationCommand) {
    try {
      await this.repository.updateOrderStatus(
        command.id,
        command.status,
        command.details,
      );
    } catch (error) {
      this.logger.error(`Failed to save exchange operation: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to save exchange operation: ${error.message}`,
      );
    }
  }
}
