import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { ExchangeRegistryService } from '../exchange-registry/exchange-registry.service';
import { ExchangeOperationService } from '../exchange-operation/exchange-operation.service';
import {
  CancelOrderCommand,
  MarketLimitCommand,
  MarketTrade,
  MarketTradeCommand,
} from './model/exchange-trade.model';
import {
  MarketOrderType,
  OrderStatus,
} from '../../common/enums/exchange-operation.enums';
import {
  CancelOperationCommand,
  ExchangeOperationCommand,
  OperationCommand,
  OrderCommand,
} from '../exchange-operation/model/exchange-operation.model';

@Injectable()
export class ExchangeTradeService {
  private readonly logger = new CustomLogger(ExchangeTradeService.name);
  constructor(
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly exchangeOperationService: ExchangeOperationService,
  ) {}

  async executeMarketTrade(command: MarketTradeCommand) {
    const { exchange } = command;
    const [exchangeInstance, savedData] = await Promise.all([
      this.exchangeRegistryService.getExchangeByName({
        exchangeName: exchange,
      }),
      this.saveOrder(command, MarketOrderType.MARKET_ORDER),
    ]);

    try {
      const result = await this.createMarketOrder(exchangeInstance, command);
      await this.saveExchangeOperation({
        orderEntityId: savedData.id,
        status: OrderStatus.EXECUTED,
        orderExtId: result.id,
        details: result,
      } as ExchangeOperationCommand);
    } catch (error) {
      await this.handleOrderError(savedData.id, error);
    }
  }

  private async createMarketOrder(
    exchangeInstance: any,
    command: MarketTradeCommand,
  ) {
    if (command.exchange === 'bigone' || command.exchange === 'mexc') {
      const ticker = await exchangeInstance.fetchTicker(command.symbol);
      const price = ticker.ask;
      const amount = command.amount.mul(price);

      return exchangeInstance.createOrder(
        command.symbol,
        MarketOrderType.MARKET_ORDER,
        command.side,
        amount,
        price,
      );
    }

    return exchangeInstance.createOrder(
      command.symbol,
      MarketOrderType.MARKET_ORDER,
      command.side,
      command.amount,
    );
  }

  async executeLimitTrade(command: MarketLimitCommand) {
    const { exchange } = command;
    const [exchangeInstance, savedData] = await Promise.all([
      this.exchangeRegistryService.getExchangeByName({
        exchangeName: exchange,
      }),
      this.saveOrder(command, MarketOrderType.LIMIT_ORDER),
    ]);

    try {
      const result = await exchangeInstance.createOrder(
        command.symbol,
        MarketOrderType.LIMIT_ORDER,
        command.side,
        command.amount,
        command.price,
      );
      await this.saveExchangeOperation({
        orderEntityId: savedData.id,
        status: OrderStatus.EXECUTED,
        orderExtId: result.id,
        details: result,
      } as ExchangeOperationCommand);
    } catch (error) {
      await this.handleOrderError(savedData.id, error);
    }
  }

  async cancelOrder(command: CancelOrderCommand) {
    const { userId, exchange } = command;
    const order = await this.getOperationByOrderExtId(command.orderId, {
      userId: command.userId,
      clientId: command.clientId,
    });
    if (!order) {
      throw new NotFoundException(`Order ${command.orderId} not found.`);
    }
    const exchangeInstance =
      await this.exchangeRegistryService.getExchangeByName({
        exchangeName: exchange,
        userId,
      });
    try {
      const result = await exchangeInstance.cancelOrder(
        command.orderId,
        command.symbol,
      );
      await this.saveExchangeOperation({
        status: OrderStatus.CANCELED,
        orderExtId: command.orderId,
        details: result,
      } as CancelOperationCommand);
    } catch (error) {
      await this.handleOrderError(null, error, command.orderId);
    }
  }

  async cancelUnfilledOrders(
    exchangeName: string,
    pair: string,
    userId: string,
  ) {
    const exchangeInstance =
    await this.exchangeRegistryService.getExchangeByName({
      exchangeName,
      userId,
    });
    return await this.cancelAllOrdersOnExchange(exchangeInstance, pair, userId);
  }
  async cancelAllOrdersOnExchange(exchangeInstance: any, pair: string, userId: string) {

    let openOrders: {
      id: string;
      datetime?: string | number;
      timestamp?: number;
    }[];

    try {
      openOrders = await exchangeInstance.fetchOpenOrders(pair);
    } catch (e) {
      this.logger.error(`Error fetching open orders: ${e.message}`);
      return 0;
    }

    const HALF_ONE_MINUTE_MS = 30 * 1000;
    const now = Date.now();

    const ordersToCancel = openOrders.filter((order) => {
      const ts =
        typeof order.timestamp === 'number'
          ? order.timestamp
          : typeof order.datetime === 'number'
            ? order.datetime
            : order.datetime
              ? new Date(order.datetime).getTime()
              : 0;

      return ts !== 0 && now - ts > HALF_ONE_MINUTE_MS;
    });

    if (ordersToCancel.length === 0) {
      return 0;
    }

    const cancelPromises = ordersToCancel.map(async (order) => {
      try {
        await exchangeInstance.cancelOrder(order.id, pair);
        return true;
      } catch (e) {
        this.logger.error(`Error canceling order: ${e.message}`);
        return false;
      }
    });

    const results = await Promise.all(cancelPromises);
    return results.filter((result) => result).length;
  }

  private async saveOrder(command: MarketTrade, orderType: MarketOrderType) {
    return await this.exchangeOperationService.saveOrderData({
      userId: command.userId,
      clientId: command.clientId,
      exchangeName: command.exchange,
      symbol: command.symbol,
      side: command.side,
      amount: command.amount,
      price: (command as MarketLimitCommand).price,
      orderType,
    } as OrderCommand);
  }

  private async saveExchangeOperation(command: OperationCommand) {
    await this.exchangeOperationService.saveExchangeOperation(command);
  }

  private async getOperationByOrderExtId(
    orderExtId: string,
    { userId, clientId }: { userId: string; clientId: string },
  ) {
    return await this.exchangeOperationService.getExchangeOperation(
      orderExtId,
      { userId, clientId },
    );
  }

  private async handleOrderError(
    orderEntityId: number | null,
    error: Error,
    orderExtId?: string,
  ) {
    this.logger.error(`Error: ${error.message}`);
    await this.saveExchangeOperation({
      orderEntityId,
      status: OrderStatus.FAILED,
      orderExtId,
      details: error,
    } as ExchangeOperationCommand);
    throw error;
  }
}
