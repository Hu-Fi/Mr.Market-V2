import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from '../../strategy.interface';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import { ArbitrageStrategyCommand } from './model/arbitrage.dto';
import {
  calculateProfitLoss,
  calculateVWAPForAmount,
  getFee,
  isArbitrageOpportunityBuyOnA,
  isArbitrageOpportunityBuyOnB,
} from '../../../../common/utils/trading-strategy.utils';
import { TradeSideType } from '../../../../common/enums/exchange-operation.enums';
import { ArbitrageTradeParams } from '../../../../common/interfaces/trading-strategy.interfaces';

@Injectable()
export class ArbitrageStrategy implements Strategy {
  private logger = new Logger(ArbitrageStrategy.name);

  constructor(
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly tradeService: ExchangeTradeService,
  ) {}

  async start(command: ArbitrageStrategyCommand): Promise<NodeJS.Timeout> {
    this.logger.debug('Starting arbitrage strategy');

    return setInterval(async () => {
      this.logger.debug('Evaluating arbitrage opportunity...');
      await this.evaluateArbitrage(command);
    }, 1000);
  }

  async stop(intervalId: NodeJS.Timeout): Promise<void> {
    if (intervalId) {
      clearInterval(intervalId);
      this.logger.debug(
        'Stopped arbitrage strategy, not filled orders have been canceled',
      );
      await this.cancelActiveOrders();
    }
  }

  async pause(intervalId: NodeJS.Timeout): Promise<void> {
    if (intervalId) {
      clearInterval(intervalId);
      this.logger.debug('Paused arbitrage strategy');
    }
  }

  private async evaluateArbitrage(
    command: ArbitrageStrategyCommand,
  ): Promise<void> {
    //TODO: get from redis cache last trade and check if it filled, if not then return
    const {
      userId,
      clientId,
      pair,
      amountToTrade,
      minProfitability,
      exchangeAName,
      exchangeBName,
    } = command;

    const exchangeA = this.exchangeRegistryService.getExchange(exchangeAName);
    const exchangeB = this.exchangeRegistryService.getExchange(exchangeBName);

    const orderBookA = await exchangeA.fetchOrderBook(pair);
    const orderBookB = await exchangeB.fetchOrderBook(pair);

    const vwapA = calculateVWAPForAmount(
      orderBookA,
      amountToTrade,
      TradeSideType.BUY,
    );
    const vwapB = calculateVWAPForAmount(
      orderBookB,
      amountToTrade,
      TradeSideType.SELL,
    );

    const tradeParams: ArbitrageTradeParams = {
      buyExchange: exchangeA,
      sellExchange: exchangeB,
      symbol: pair,
      amount: amountToTrade,
      userId,
      clientId,
      buyPrice: vwapA,
      sellPrice: vwapB,
    };

    if (isArbitrageOpportunityBuyOnA(vwapA, vwapB, minProfitability)) {
      this.logger.debug(
        `User ${userId}, Client ${clientId}: Arbitrage opportunity for ${pair} (VWAP): Buy on ${exchangeAName} at ${vwapA}, sell on ${exchangeBName} at ${vwapB}`,
      );
      await this.executeArbitrageTrade(tradeParams);
    } else if (isArbitrageOpportunityBuyOnB(vwapA, vwapB, minProfitability)) {
      this.logger.debug(
        `User ${userId}, Client ${clientId}: Arbitrage opportunity for ${pair} (VWAP): Buy on ${exchangeBName} at ${vwapB}, sell on ${exchangeAName} at ${vwapA}`,
      );
      await this.executeArbitrageTrade({
        buyExchange: exchangeB,
        sellExchange: exchangeA,
        symbol: pair,
        amount: amountToTrade,
        userId,
        clientId,
        buyPrice: vwapB,
        sellPrice: vwapA,
      });
    } else {
      this.logger.debug('No arbitrage opportunity found');
      return;
    }

    //TODO: persist data to database - arbitrage history
    //TODO: persist data to redis cache - to check last trade is filled
  }

  async executeArbitrageTrade(params: ArbitrageTradeParams) {
    const {
      buyExchange,
      sellExchange,
      symbol,
      amount,
      userId,
      clientId,
      buyPrice,
      sellPrice,
    } = params;

    try {
      const buyOrder: any = await this.tradeService.executeLimitTrade({
        userId,
        clientId,
        exchange: buyExchange.id,
        symbol,
        side: TradeSideType.BUY,
        amount,
        price: buyPrice,
      });

      const sellOrder: any = await this.tradeService.executeLimitTrade({
        userId,
        clientId,
        exchange: sellExchange.id,
        symbol,
        side: TradeSideType.SELL,
        amount,
        price: sellPrice,
      });

      const buyFee = getFee(buyOrder);
      const sellFee = getFee(sellOrder);
      const profitLoss = calculateProfitLoss(
        buyPrice,
        sellPrice,
        amount,
        buyFee,
        sellFee,
      );

      this.logger.debug(
        `Arbitrage trade executed for user ${userId}, client ${clientId}: Buy on ${buyExchange.id} at ${buyPrice}, sell on ${sellExchange.id} at ${sellPrice}, Profit/Loss: ${profitLoss}`,
      );
    } catch (error) {
      this.logger.error(`Failed to execute arbitrage trade: ${error.message}`);
    }
  }

  async cancelActiveOrders() {
    //TODO: get last order from redis cache and if it is not filled then execute exchange.cancelOrder(orderId)
  }
}
