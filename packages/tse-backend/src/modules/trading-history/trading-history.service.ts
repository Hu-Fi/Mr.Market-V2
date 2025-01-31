import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../exchange-operation/order.repository';
import { Between, FindManyOptions } from 'typeorm';
import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../../common/enums/exchange-operation.enums';
import {
  GetUserStrategyHistoryParamsCommand,
  GetUserTradingHistoryParamsCommand,
  GetUserTradingHistoryQueryCommand,
} from './model/trading-history.model';
import { MarketMakingRepository } from '../trading-strategy/strategies/market-making/market-making.repository';
import { ArbitrageStrategyRepository } from '../trading-strategy/strategies/arbitrage/arbitrage.repository';

@Injectable()
export class TradingHistoryService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly marketMakingRepository: MarketMakingRepository,
    private readonly arbitrageRepository: ArbitrageStrategyRepository,
  ) {}

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

    return await this.orderRepository.find(query);
  }

  async getUserStrategyHistory(params: GetUserStrategyHistoryParamsCommand) {
    const marketMakingStrategies =
      await this.marketMakingRepository.findStrategiesByUserId(
        params.userId.toString(),
      );
    const arbitrageStrategies =
      await this.arbitrageRepository.findStrategiesByUserId(
        params.userId.toString(),
      );

    const marketMakingResponse = marketMakingStrategies.map((strategy) => ({
      id: strategy.id,
      userId: strategy.userId,
      clientId: strategy.clientId,
      strategyType: 'marketMaking',
      parameters: {
        userId: strategy.userId,
        clientId: strategy.clientId,
        pair: `${strategy.sideA}/${strategy.sideB}`,
        exchangeName: strategy.exchangeName,
        bidSpread: strategy.bidSpread,
        askSpread: strategy.askSpread,
        orderAmount: strategy.orderAmount,
        orderRefreshTime: strategy.checkIntervalSeconds * 1000,
        numberOfLayers: strategy.numberOfLayers,
        priceSourceType: strategy.priceSourceType,
        amountChangePerLayer: strategy.amountChangePerLayer,
        amountChangeType: strategy.amountChangeType,
        ceilingPrice: strategy.ceilingPrice,
        floorPrice: strategy.floorPrice,
      },
      lastTradingAttemptAt: strategy.lastTradingAttemptAt,
      status: strategy.status,
      createdAt: strategy.createdAt,
      updatedAt: strategy.updatedAt,
    }));

    const arbitrageResponse = arbitrageStrategies.map((strategy) => ({
      id: strategy.id,
      userId: strategy.userId,
      clientId: strategy.clientId,
      strategyType: 'arbitrage',
      parameters: {
        userId: strategy.userId,
        clientId: strategy.clientId,
        pair: `${strategy.sideA}/${strategy.sideB}`,
        exchangeAName: strategy.exchangeAName,
        exchangeBName: strategy.exchangeBName,
        checkIntervalSeconds: strategy.checkIntervalSeconds,
        amountToTrade: strategy.amountToTrade,
        minProfitability: strategy.minProfitability,
        maxOpenOrders: strategy.maxOpenOrders,
      },
      lastTradingAttemptAt: strategy.lastTradingAttemptAt,
      status: strategy.status,
      createdAt: strategy.createdAt,
      updatedAt: strategy.updatedAt,
    }));

    return [...marketMakingResponse, ...arbitrageResponse];
  }
}
