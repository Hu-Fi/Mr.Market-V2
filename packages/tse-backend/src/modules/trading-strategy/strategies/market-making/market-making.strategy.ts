import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from '../../strategy.interface';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import { MarketMakingStrategyCommand } from './model/market-making.dto';
import {
  calculateOrderDetails,
  getPriceSource,
} from '../../../../common/utils/trading-strategy.utils';
import { TradeSideType } from '../../../../common/enums/exchange-operation.enums';
import {
  OrderDetail,
  PlaceOrderParams,
} from '../../../../common/interfaces/trading-strategy.interfaces';

@Injectable()
export class MarketMakingStrategy implements Strategy {
  private logger = new Logger(MarketMakingStrategy.name);

  constructor(
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly tradeService: ExchangeTradeService,
  ) {}

  async start(command: MarketMakingStrategyCommand): Promise<NodeJS.Timeout> {
    this.logger.debug('Starting market making strategy');

    return setInterval(async () => {
      this.logger.debug('Evaluating market making opportunity...');
      await this.evaluateMarketMaking(command);
    }, command.orderRefreshTime);
  }

  async stop(intervalId: NodeJS.Timeout): Promise<void> {
    if (intervalId) {
      clearInterval(intervalId);
      await this.cancelActiveOrders();
      this.logger.debug(
        'Stopped market making strategy, not filled orders have been canceled',
      );
    }
  }

  async pause(intervalId: NodeJS.Timeout): Promise<void> {
    if (intervalId) {
      clearInterval(intervalId);
      this.logger.debug('Paused market making strategy');
    }
  }

  async evaluateMarketMaking(command: MarketMakingStrategyCommand) {
    const {
      userId,
      clientId,
      pair,
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

    //TODO: persist data to database - market making history
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
