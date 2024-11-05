import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../exchange-operation/order.repository';
import { Between, FindManyOptions } from 'typeorm';
import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../../common/enums/exchange-operation.enums';
import {
  GetUserTradingHistoryParamsCommand,
  GetUserTradingHistoryQueryCommand,
} from './model/trading-history.model';

@Injectable()
export class TradingHistoryService {
  constructor(private readonly repository: OrderRepository) {}

  async getUserTradingHistory(
    params: GetUserTradingHistoryParamsCommand,
    queries: GetUserTradingHistoryQueryCommand,
  ) {
    const { startDate, endDate, exchangeName, symbol, type, status, side } =
      queries;
    const { page = 1, limit = 10 } = queries;
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = queries;

    const query: FindManyOptions = {
      where: {
        userId: params.userId,
        ...(startDate &&
          endDate && {
            createdAt: Between(new Date(startDate), new Date(endDate)),
          }),
        ...(exchangeName && { exchangeName }),
        ...(symbol && { symbol }),
        ...(type && { type: MarketOrderType[`${type.toUpperCase()}_ORDER`] }),
        ...(status && { status: OrderStatus[status.toUpperCase()] }),
        ...(side && { side: TradeSideType[side.toUpperCase()] }),
      },
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sortBy]: sortOrder.toUpperCase(),
      },
    };

    return await this.repository.find(query);
  }
}
