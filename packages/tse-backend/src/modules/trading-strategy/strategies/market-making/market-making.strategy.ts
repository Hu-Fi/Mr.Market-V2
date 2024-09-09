import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
} from '../../../../common/enums/strategy-type.enums';
import {
  calculateOrderDetails,
  createStrategyKey,
  getPriceSource,
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

  async pause(command: MarketMakingStrategyActionCommand): Promise<void> {
    const strategyEntity: MarketMakingStrategyData =
      await this.marketMakingService.findLatestStrategyByUserId(command.userId);
    if (!strategyEntity) {
      throw new BadRequestException('MarketMaking strategy not found');
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
      throw new BadRequestException('MarketMaking strategy not found');
    }

    await this.marketMakingService.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.STOPPED,
    );

    const strategy = this.strategies.get(strategyEntity.id);
    if (strategy) {
      clearInterval(strategy.intervalId);
    }

    await this.cancelActiveOrders();

    this.logger.debug(
      'Stopped market making strategy, not filled orders have been canceled',
    );
  }

  async delete(command: MarketMakingStrategyActionCommand) {
    const strategyEntity: MarketMakingStrategyData =
      await this.marketMakingService.findLatestStrategyByUserId(command.userId);
    if (!strategyEntity) {
      throw new BadRequestException('MarketMaking strategy not found');
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

    this.logger.debug('Soft deleted market making strategy');
  }

  async start(strategies: MarketMakingStrategyData[]): Promise<void> {
    this.logger.debug('Starting market making strategy');

    for (const strategy of strategies) {
      if (!this.strategies.get(strategy.id)) {
        const intervalId = setInterval(async () => {
          await this.evaluateMarketMaking(strategy);
        }, strategy.checkIntervalSeconds * 1000);

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

    await this.cancelActiveOrders();

    const exchange = this.exchangeRegistryService.getExchange(exchangeName);

    const pair = `${sideA}/${sideB}`;
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
      const { currentOrderAmount, buyPrice, sellPrice, shouldBuy, shouldSell } =
        detail;

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

    //TODO: persist data to redis cache - to check last trade is filled
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

  async cancelActiveOrders() {
    //TODO: get last order from redis cache and if it is not filled then execute exchange.cancelOrder(orderId)
  }
}
