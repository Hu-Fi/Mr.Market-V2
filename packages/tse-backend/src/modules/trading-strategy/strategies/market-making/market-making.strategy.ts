import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Strategy } from '../../strategy.interface';
import {
  OrderDetail,
  PlaceOrderParams,
  StrategyConfig,
} from '../../../../common/interfaces/trading-strategy.interfaces';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import { MarketMakingService } from './market-making.service';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyCommand,
  MarketMakingStrategyData,
} from './model/market-making.dto';
import {
  StrategyInstanceStatus,
  StrategyTypeEnums,
  TimeUnit,
} from '../../../../common/enums/strategy-type.enums';
import {
  calculateOrderDetails,
  createStrategyKey,
  getPriceSource,
  isExchangeSupported,
  isPairSupported,
} from '../../../../common/utils/trading-strategy.utils';
import { TradeSideType } from '../../../../common/enums/exchange-operation.enums';

@Injectable()
export class MarketMakingStrategy implements Strategy {
  private logger = new Logger(MarketMakingStrategy.name);
  private strategies: Map<number, StrategyConfig> = new Map();

  constructor(
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly tradeService: ExchangeTradeService,
    private readonly marketMakingService: MarketMakingService,
  ) {}

  async create(command: MarketMakingStrategyCommand): Promise<void> {
    this.validateExchangesAndPairs(command);

    await this.marketMakingService.createStrategy({
      userId: command.userId,
      clientId: command.clientId,
      sideA: command.sideA,
      sideB: command.sideB,
      exchangeName: command.exchangeName,
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

  private validateExchangesAndPairs(
    command: MarketMakingStrategyCommand,
  ): void {
    const supportedExchanges =
      this.exchangeRegistryService.getSupportedExchanges();

    if (!isExchangeSupported(command.exchangeName, supportedExchanges)) {
      throw new NotFoundException(
        `Exchange ${command.exchangeName} is not supported`,
      );
    }

    const supportedSymbolsExchangeA =
      this.exchangeRegistryService.getSupportedPairs(command.exchangeName);

    if (
      !isPairSupported(
        `${command.sideA}/${command.sideB}`,
        supportedSymbolsExchangeA,
      )
    ) {
      throw new NotFoundException(
        `Symbol ${command.sideA}/${command.sideB} is not supported on exchange ${command.exchangeName}`,
      );
    }
  }

  async pause(command: MarketMakingStrategyActionCommand): Promise<void> {
    const strategyEntity: MarketMakingStrategyData =
      await this.marketMakingService.findLatestStrategyByUserId(command.userId);
    if (!strategyEntity) {
      throw new NotFoundException('MarketMaking strategy not found');
    }

    await this.marketMakingService.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.PAUSED,
    );
    const strategy = this.strategies.get(strategyEntity.id);
    if (strategy) {
      clearInterval(strategy.intervalId);
    }

    this.logger.debug('Paused market making strategy');
  }

  async stop(command: MarketMakingStrategyActionCommand): Promise<void> {
    const strategyEntity: MarketMakingStrategyData =
      await this.marketMakingService.findLatestStrategyByUserId(command.userId);
    if (!strategyEntity) {
      throw new NotFoundException('MarketMaking strategy not found');
    }

    await this.marketMakingService.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.STOPPED,
    );

    const strategy = this.strategies.get(strategyEntity.id);
    if (strategy) {
      clearInterval(strategy.intervalId);
    }

    const exchange = this.exchangeRegistryService.getExchangeByName(
      strategyEntity.exchangeName,
    );

    const pair = `${strategyEntity.sideA}/${strategyEntity.sideB}`;

    this.cancelUnfilledOrders(exchange, pair).then((canceledCount) => {
      this.logger.debug(
        `Cancelled ${canceledCount} unfilled orders for ${pair} on ${exchange.name}`,
      );
    });

    this.logger.debug(
      'Stopped market making strategy, unfilled orders have been canceled',
    );
  }

  async delete(command: MarketMakingStrategyActionCommand) {
    const strategyEntity: MarketMakingStrategyData =
      await this.marketMakingService.findLatestStrategyByUserId(command.userId);
    if (!strategyEntity) {
      throw new NotFoundException('MarketMaking strategy not found');
    }

    await this.marketMakingService.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.DELETED,
    );

    const strategy = this.strategies.get(strategyEntity.id);
    if (strategy) {
      clearInterval(strategy.intervalId);
      this.strategies.delete(strategyEntity.id);
    }

    const exchange = this.exchangeRegistryService.getExchangeByName(
      strategyEntity.exchangeName,
    );

    const pair = `${strategyEntity.sideA}/${strategyEntity.sideB}`;

    this.cancelUnfilledOrders(exchange, pair).then((canceledCount) => {
      this.logger.debug(
        `Cancelled ${canceledCount} unfilled orders for ${pair} on ${exchange.name}`,
      );
    });

    this.logger.debug('Soft deleted market making strategy');
  }

  async start(strategies: MarketMakingStrategyData[]): Promise<void> {
    this.logger.debug(
      `Amount of active market making strategies: ${strategies.length}`,
    );

    for (const strategy of strategies) {
      if (!this.strategies.get(strategy.id)) {
        const intervalId = setInterval(async () => {
          await this.evaluateMarketMaking(strategy);
        }, strategy.checkIntervalSeconds * TimeUnit.MILLISECONDS);

        const configuration: StrategyConfig = {
          strategyKey: createStrategyKey({
            type: StrategyTypeEnums.MARKET_MAKING,
            user_id: strategy.userId,
            client_id: strategy.clientId,
          }),
          intervalId,
          status: StrategyInstanceStatus.RUNNING,
        };
        this.strategies.set(strategy.id, configuration);
      }
    }
  }

  async evaluateMarketMaking(command: MarketMakingStrategyCommand) {
    const {
      userId,
      clientId,
      sideA,
      sideB,
      exchangeName,
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

    const exchange =
      this.exchangeRegistryService.getExchangeByName(exchangeName);
    const pair = `${sideA}/${sideB}`;

    this.cancelUnfilledOrders(exchange, pair).then((canceledCount) => {
      this.logger.debug(
        `Cancelled ${canceledCount} unfilled orders for ${pair} on ${exchange.name}`,
      );
    });

    const priceSource = await getPriceSource(exchange, pair, priceSourceType);

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
      await this.handleBuyOrder(
        detail,
        exchange,
        pair,
        priceSource,
        userId,
        clientId,
        exchangeName,
        ceilingPrice,
      );
      await this.handleSellOrder(
        detail,
        exchange,
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
    exchange,
    pair: string,
    priceSource: number,
    userId: string,
    clientId: string,
    exchangeName: string,
    ceilingPrice: number,
  ) {
    const { currentOrderAmount, buyPrice, shouldBuy } = detail;

    if (shouldBuy) {
      const adjustedAmount = exchange.amountToPrecision(
        pair,
        currentOrderAmount,
      );
      const adjustedPrice = exchange.priceToPrecision(pair, buyPrice);
      await this.placeOrder({
        userId,
        clientId,
        exchangeName,
        pair,
        side: TradeSideType.BUY,
        amount: parseFloat(adjustedAmount),
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
    exchange,
    pair: string,
    priceSource: number,
    userId: string,
    clientId: string,
    exchangeName: string,
    floorPrice: number,
  ) {
    const { currentOrderAmount, sellPrice, shouldSell } = detail;

    if (shouldSell) {
      const adjustedAmount = exchange.amountToPrecision(
        pair,
        currentOrderAmount,
      );
      const adjustedPrice = exchange.priceToPrecision(pair, sellPrice);
      await this.placeOrder({
        userId,
        clientId,
        exchangeName,
        pair,
        side: TradeSideType.SELL,
        amount: parseFloat(adjustedAmount),
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
      return;
    }

    this.logger.debug(
      `Order placed for user ${userId}, client ${clientId}: ${side} ${amount} ${pair} at ${price} on ${exchangeName}`,
    );
  }

  async cancelUnfilledOrders(exchange, pair: string) {
    const openOrders = await exchange.fetchOpenOrders(pair);

    const cancelPromises = openOrders.map(async (order) => {
      try {
        await exchange.cancelOrder(order.id, pair);
        return true;
      } catch (e) {
        this.logger.error(`Error canceling order: ${e.message}`);
        return false;
      }
    });

    const results = await Promise.all(cancelPromises);
    return results.filter((result) => result).length;
  }
}
