import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Strategy } from '../../strategy.interface';
import {
  OrderDetail,
  PlaceOrderParams,
} from '../../../../common/interfaces/trading-strategy.interfaces';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import { MarketMakingService } from './market-making.service';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyCommand,
  MarketMakingStrategyData,
} from './model/market-making.dto';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';
import {
  calculateOrderDetails,
  getPriceSource,
  isExchangeSupported,
  isPairSupported,
} from '../../../../common/utils/trading-strategy.utils';
import { TradeSideType } from '../../../../common/enums/exchange-operation.enums';
import { ExchangeDataService } from '../../../exchange-data/exchange-data.service';
import { CcxtIntegrationService } from '../../../../integrations/ccxt.integration.service';
import { Decimal } from 'decimal.js';

@Injectable()
export class MarketMakingStrategy implements Strategy {
  private logger = new Logger(MarketMakingStrategy.name);

  private static ERROR_MESSAGES = {
    EXCHANGE_NOT_SUPPORTED: (exchange: string) =>
      `Exchange ${exchange} is not supported`,
    SYMBOL_NOT_SUPPORTED: (symbol: string, exchange: string) =>
      `Symbol ${symbol} is not supported on exchange ${exchange}`,
    STRATEGY_NOT_FOUND: 'MarketMaking strategy not found',
  };

  constructor(
    private readonly exchangeDataService: ExchangeDataService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly tradeService: ExchangeTradeService,
    private readonly marketMakingService: MarketMakingService,
    private readonly ccxtGateway: CcxtIntegrationService,
  ) {}

  async create(command: MarketMakingStrategyCommand): Promise<void> {
    await this.validateExchangesAndPairs(command);

    const exchangeInstance =
      await this.exchangeRegistryService.getExchangeByName({
        exchangeName: command.exchangeName,
        userId: command.userId,
      });

    const ticker = await exchangeInstance.fetchTicker(
      `${command.sideA}/${command.sideB}`,
    );

    await this.marketMakingService.createStrategy({
      userId: command.userId,
      clientId: command.clientId,
      sideA: command.sideA,
      sideB: command.sideB,
      exchangeName: command.exchangeName,
      oracleExchangeName: command.oracleExchangeName,
      startPrice: ticker.last,
      bidSpread: command.bidSpread,
      askSpread: command.askSpread,
      orderAmount: command.orderAmount,
      checkIntervalSeconds: command.checkIntervalSeconds,
      numberOfLayers: command.numberOfLayers,
      priceSourceType: command.priceSourceType,
      amountChangePerLayer: command.amountChangePerLayer,
      amountChangeType: command.amountChangeType,
      ceilingPrice: command.ceilingPrice,
      floorPrice: command.floorPrice,
      status: StrategyInstanceStatus.RUNNING,
    });
  }

  async start(strategies: MarketMakingStrategyData[]): Promise<void> {
    this.logger.debug(
      `Amount of active market making strategies: ${strategies.length}`,
    );

    for (const strategy of strategies) {
      if (strategy.status === StrategyInstanceStatus.RUNNING) {
        const { checkIntervalSeconds, lastTradingAttemptAt } = strategy;

        if (!lastTradingAttemptAt) {
          await this.attemptEvaluation(strategy);
          continue;
        }

        const nextAllowedTime = new Date(
          lastTradingAttemptAt.getTime() + checkIntervalSeconds * 1000,
        );

        if (new Date() >= nextAllowedTime) {
          await this.attemptEvaluation(strategy);
        }
      }
    }
  }

  async attemptEvaluation(strategy: MarketMakingStrategyData) {
    try {
      await this.evaluateMarketMaking(strategy);
      await this.updateStrategyLastTradingAttempt(strategy.id, new Date());
    } catch (e) {
      await this.updateStrategyStatusById(
        strategy.id,
        StrategyInstanceStatus.PAUSED,
      );
      const errorMessage = e instanceof Error ? e.message : String(e);
      await this.updateStrategyPausedReasonById(strategy.id, errorMessage);
    }
  }

  async pause(command: MarketMakingStrategyActionCommand): Promise<void> {
    const strategyEntity = await this.getStrategyById(command.id, {
      userId: command.userId,
      clientId: command.clientId,
    });
    if (strategyEntity.status === StrategyInstanceStatus.RUNNING) {
      await this.updateStrategyStatusById(
        strategyEntity.id,
        StrategyInstanceStatus.PAUSED,
      );
      this.logger.debug('Paused market making strategy');
      await this.updateStrategyPausedReasonById(
        strategyEntity.id,
        'Manually paused by user',
      );
    }
  }

  async stop(command: MarketMakingStrategyActionCommand): Promise<void> {
    const strategyEntity = await this.getStrategyById(command.id, {
      userId: command.userId,
      clientId: command.clientId,
    });
    await this.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.STOPPED,
    );

    const pair = `${strategyEntity.sideA}/${strategyEntity.sideB}`;
    await this.tradeService.cancelUnfilledOrders(
      strategyEntity.exchangeName,
      pair,
      command.userId,
    );

    this.logger.debug(
      'Stopped market making strategy, unfilled orders have been canceled',
    );
  }

  async delete(command: MarketMakingStrategyActionCommand) {
    const strategyEntity = await this.getStrategyById(command.id, {
      userId: command.userId,
      clientId: command.clientId,
    });
    await this.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.DELETED,
    );

    const pair = `${strategyEntity.sideA}/${strategyEntity.sideB}`;
    await this.tradeService.cancelUnfilledOrders(
      strategyEntity.exchangeName,
      pair,
      command.userId,
    );

    this.logger.debug('Soft deleted market making strategy');
  }

  private async validateExchangesAndPairs(
    command: MarketMakingStrategyCommand,
  ): Promise<void> {
    const { userId, exchangeName, sideA, sideB } = command;
    await this.exchangeRegistryService.getExchangeByName({
      exchangeName,
      userId,
    });
    const supportedExchanges =
      await this.exchangeRegistryService.getSupportedExchanges();

    if (!isExchangeSupported(exchangeName, supportedExchanges)) {
      throw new NotFoundException(
        MarketMakingStrategy.ERROR_MESSAGES.EXCHANGE_NOT_SUPPORTED(
          exchangeName,
        ),
      );
    }

    const supportedSymbols =
      await this.exchangeDataService.getSupportedPairs(exchangeName);
    const pair = `${sideA}/${sideB}:${sideB}`;
    const altPair = `${sideA}/${sideB}`;
    if (
      !isPairSupported(pair, supportedSymbols) &&
      !isPairSupported(altPair, supportedSymbols)
    ) {
      throw new NotFoundException(
        MarketMakingStrategy.ERROR_MESSAGES.SYMBOL_NOT_SUPPORTED(
          altPair,
          exchangeName,
        ),
      );
    }
  }

  async evaluateMarketMaking(command: MarketMakingStrategyCommand) {
    const {
      userId,
      clientId,
      sideA,
      sideB,
      exchangeName,
      oracleExchangeName,
      bidSpread,
      askSpread,
      orderAmount,
      numberOfLayers,
      priceSourceType,
      amountChangePerLayer,
      amountChangeType,
      ceilingPrice,
      floorPrice,
    } = command;

    const pair = `${sideA}/${sideB}`;

    this.tradeService
      .cancelUnfilledOrders(exchangeName, pair, userId)
      .then((canceledCount) => {
        this.logger.debug(
          `Cancelled ${canceledCount} unfilled orders for ${pair} on ${exchangeName}`,
        );
      });

    const exchangeInstance =
      await this.exchangeRegistryService.getExchangeByName({
        exchangeName,
      });

    let source: any;

    if (oracleExchangeName) {
      source = await this.exchangeRegistryService.getExchangeByName({
        exchangeName: oracleExchangeName,
      });
      this.logger.debug(
        `Oracle exchange provided, price is calculated from ${source.name}`,
      );
    } else {
      source = exchangeInstance;
    }

    const priceSource = await getPriceSource(source, pair, priceSourceType);

    const orderDetails: OrderDetail[] = calculateOrderDetails(
      orderAmount,
      numberOfLayers,
      amountChangeType,
      amountChangePerLayer,
      bidSpread,
      askSpread,
      priceSource,
      ceilingPrice,
      floorPrice,
    );

    for (const detail of orderDetails) {
      const adjustedAmount = this.ccxtGateway.amountToPrecision(
        exchangeInstance,
        pair,
        detail.currentOrderAmount,
      );
      let adjustedPrice = this.ccxtGateway.priceToPrecision(
        exchangeInstance,
        pair,
        detail.buyPrice,
      );

      await this.handleBuyOrder(
        detail,
        adjustedAmount,
        adjustedPrice,
        pair,
        priceSource,
        userId,
        clientId,
        exchangeName,
        ceilingPrice,
      );

      adjustedPrice = this.ccxtGateway.priceToPrecision(
        exchangeInstance,
        pair,
        detail.sellPrice,
      );

      await this.handleSellOrder(
        detail,
        adjustedAmount,
        adjustedPrice,
        pair,
        priceSource,
        userId,
        clientId,
        exchangeName,
        floorPrice,
      );
    }
  }

  private async handleBuyOrder(
    detail: OrderDetail,
    adjustedAmount: string,
    adjustedPrice: string,
    pair: string,
    priceSource: number,
    userId: string,
    clientId: string,
    exchangeName: string,
    ceilingPrice: number,
  ) {
    const { shouldBuy } = detail;

    if (shouldBuy) {
      await this.placeOrder({
        userId,
        clientId,
        exchangeName,
        pair,
        side: TradeSideType.BUY,
        amount: new Decimal(adjustedAmount),
        price: parseFloat(adjustedPrice),
      });
    } else {
      this.logger.debug(
        `Skipping buy order for ${pair} as price source ${priceSource} is above the ceiling price ${ceilingPrice}.`,
      );
    }
  }

  private async handleSellOrder(
    detail: OrderDetail,
    adjustedAmount: string,
    adjustedPrice: string,
    pair: string,
    priceSource: number,
    userId: string,
    clientId: string,
    exchangeName: string,
    floorPrice: number,
  ) {
    const { shouldSell } = detail;

    if (shouldSell) {
      await this.placeOrder({
        userId,
        clientId,
        exchangeName,
        pair,
        side: TradeSideType.SELL,
        amount: new Decimal(adjustedAmount),
        price: parseFloat(adjustedPrice),
      });
    } else {
      this.logger.debug(
        `Skipping sell order for ${pair} as price source ${priceSource} is below the floor price ${floorPrice}.`,
      );
    }
  }

  async placeOrder(params: PlaceOrderParams) {
    const { userId, clientId, exchangeName, pair, side, amount, price } =
      params;
    try {
      await this.tradeService.executeLimitTrade({
        userId,
        clientId,
        exchange: exchangeName,
        symbol: pair,
        side,
        amount,
        price,
      });
    } catch (e) {
      this.logger.error(`Error placing order: ${e.message}`);
      throw e;
    }

    this.logger.debug(
      `Order placed for user ${userId}, client ${clientId}: ${side} ${amount} ${pair} at ${price} on ${exchangeName}`,
    );
  }
  private async getStrategyById(
    strategyId: number,
    options?: any,
  ): Promise<MarketMakingStrategyData> {
    const strategyEntity = await this.marketMakingService.findStrategyById(
      strategyId,
      options,
    );
    if (!strategyEntity) {
      throw new NotFoundException(
        MarketMakingStrategy.ERROR_MESSAGES.STRATEGY_NOT_FOUND,
      );
    }
    return strategyEntity;
  }

  private async updateStrategyStatusById(
    id: number,
    newState: StrategyInstanceStatus,
  ) {
    return await this.marketMakingService.updateStrategyStatusById(
      id,
      newState,
    );
  }

  private async updateStrategyPausedReasonById(id: number, reason: string) {
    return await this.marketMakingService.updateStrategyPausedReasonById(
      id,
      reason,
    );
  }

  private async updateStrategyLastTradingAttempt(
    strategyId: number,
    date: Date,
  ) {
    await this.marketMakingService.updateStrategyLastTradingAttemptById(
      strategyId,
      date,
    );
  }
}
