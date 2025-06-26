import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Strategy } from '../../strategy.interface';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import {
  VolumeStrategyActionCommand,
  VolumeStrategyCommand,
  VolumeStrategyData,
} from './model/volume.model';
import {
  buildPair,
  isExchangeSupported,
  isPairSupported,
} from '../../../../common/utils/trading-strategy.utils';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';
import { VolumeService } from './volume.service';
import { ExchangeDataService } from '../../../exchange-data/exchange-data.service';
import { GetDefaultAccountStrategy } from '../../../exchange-registry/exchange-manager/strategies/get-default-account.strategy';
import { GetAdditionalAccountStrategy } from '../../../exchange-registry/exchange-manager/strategies/get-additional-account.strategy';
import {
  MarketOrderType,
  TradeSideType,
} from '../../../../common/enums/exchange-operation.enums';
import { Decimal } from 'decimal.js';

@Injectable()
export class VolumeStrategy implements Strategy {
  private logger = new Logger(VolumeStrategy.name);

  private static ERROR_MESSAGES = {
    EXCHANGE_NOT_SUPPORTED: (exchange: string) =>
      `Exchange ${exchange} is not supported`,
    SYMBOL_NOT_SUPPORTED: (symbol: string, exchange: string) =>
      `Symbol ${symbol} is not supported on exchange ${exchange}`,
    STRATEGY_NOT_FOUND: 'Arbitrage strategy not found',
  };

  constructor(
    private readonly exchangeDataService: ExchangeDataService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly tradeService: ExchangeTradeService,
    private readonly volumeService: VolumeService,
    private readonly defaultStrategy: GetDefaultAccountStrategy,
    private readonly additionalAccountStrategy: GetAdditionalAccountStrategy,
  ) {}

  async create(command: VolumeStrategyCommand): Promise<void> {
    await this.validateExchangesAndPairs(command);

    await this.volumeService.createStrategy({
      userId: command.userId,
      clientId: command.clientId,
      exchangeName: command.exchangeName,
      sideA: command.sideA,
      sideB: command.sideB,
      amountToTrade: command.amountToTrade,
      incrementPercentage: command.incrementPercentage,
      tradeIntervalSeconds: command.tradeIntervalSeconds,
      numTotalTrades: command.numTotalTrades,
      pricePushRate: command.pricePushRate,
      status: StrategyInstanceStatus.RUNNING,
    });
  }

  async start(strategies: VolumeStrategyData[]): Promise<void> {
    this.logger.debug(
      `Amount of active volume strategies: ${strategies.length}`,
    );

    for (const strategy of strategies) {
      if (strategy.status === StrategyInstanceStatus.RUNNING) {
        const { tradeIntervalSeconds, lastTradingAttemptAt } = strategy;

        if (!lastTradingAttemptAt) {
          await this.attemptEvaluation(strategy);
          continue;
        }

        const nextAllowedTime = new Date(
          lastTradingAttemptAt.getTime() + tradeIntervalSeconds * 1000,
        );
        if (new Date() >= nextAllowedTime) {
          await this.attemptEvaluation(strategy);
        }
      }
    }
  }

  async attemptEvaluation(strategy: VolumeStrategyData) {
    try {
      await Promise.all([
        this.executeVolumeStrategy(strategy),
        this.updateStrategyLastTradingAttempt(strategy.id, new Date()),
      ]);
    } catch (e) {
      await this.updateStrategyStatusById(
        strategy.id,
        StrategyInstanceStatus.PAUSED,
      );
      const errorMessage = e instanceof Error ? e.message : String(e);
      await this.updateStrategyPausedReasonById(strategy.id, errorMessage);
    }
  }

  async pause(command: VolumeStrategyActionCommand): Promise<void> {
    const strategyEntity = await this.getStrategyEntity(command.id, {
      userId: command.userId,
      clientId: command.clientId,
    });
    if (strategyEntity.status === StrategyInstanceStatus.RUNNING) {
      await this.updateStrategyStatusById(
        strategyEntity.id,
        StrategyInstanceStatus.PAUSED,
      );
      this.logger.debug('Paused volume strategy');
      await this.updateStrategyPausedReasonById(
        strategyEntity.id,
        'Manually paused by user',
      );
    }
  }

  async stop(command: VolumeStrategyActionCommand): Promise<void> {
    const strategyEntity = await this.getStrategyEntity(command.id, {
      userId: command.userId,
      clientId: command.clientId,
    });
    await this.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.STOPPED,
    );

    const pair = buildPair(strategyEntity.sideA, strategyEntity.sideB);
    await this.cancelStrategyOrders(strategyEntity, pair);

    this.logger.debug(
      'Stopped volume strategy, not filled orders have been canceled',
    );
  }

  async delete(command: VolumeStrategyActionCommand): Promise<void> {
    const strategyEntity = await this.getStrategyEntity(command.id, {
      userId: command.userId,
      clientId: command.clientId,
    });
    await this.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.DELETED,
    );

    const pair = buildPair(strategyEntity.sideA, strategyEntity.sideB);
    await this.cancelStrategyOrders(strategyEntity, pair);

    this.logger.debug('Soft deleted volume strategy');
  }

  private async validateExchangesAndPairs(
    command: VolumeStrategyCommand,
  ): Promise<void> {
    const { userId, exchangeName, sideA, sideB } = command;
    const pair = buildPair(sideA, sideB);
    const altPair = `${pair}:${sideB}`;
    await Promise.all([
      this.validatePair(altPair, exchangeName),
      this.validateExchange(exchangeName, userId),
    ]);
  }

  private async validateExchange(
    exchangeName: string,
    userId: string,
  ): Promise<void> {
    await this.exchangeRegistryService.getExchangeByName({
      exchangeName,
      userId,
    });
    const supportedExchanges =
      await this.exchangeRegistryService.getSupportedExchanges();
    if (!isExchangeSupported(exchangeName, supportedExchanges)) {
      throw new NotFoundException(
        VolumeStrategy.ERROR_MESSAGES.EXCHANGE_NOT_SUPPORTED(exchangeName),
      );
    }
  }

  private async validatePair(
    symbol: string,
    exchangeName: string,
  ): Promise<void> {
    const supportedSymbols =
      await this.exchangeDataService.getSupportedPairs(exchangeName);
    const altSymbol = symbol.includes(':') ? symbol.split(':')[0] : symbol;
    if (
      !isPairSupported(symbol, supportedSymbols) &&
      !isPairSupported(altSymbol, supportedSymbols)
    ) {
      throw new NotFoundException(
        VolumeStrategy.ERROR_MESSAGES.SYMBOL_NOT_SUPPORTED(
          altSymbol,
          exchangeName,
        ),
      );
    }
  }

  private async getStrategyEntity(
    strategyId: number,
    options?: any,
  ): Promise<VolumeStrategyData> {
    const strategyEntity = await this.volumeService.findStrategyById(
      strategyId,
      options,
    );
    if (!strategyEntity) {
      throw new NotFoundException(
        VolumeStrategy.ERROR_MESSAGES.STRATEGY_NOT_FOUND,
      );
    }
    return strategyEntity;
  }

  private async updateStrategyStatusById(
    strategyId: number,
    status: StrategyInstanceStatus,
  ): Promise<void> {
    await this.volumeService.updateStrategyStatusById(strategyId, status);
  }

  private async updateStrategyLastTradingAttempt(
    strategyId: number,
    date: Date,
  ) {
    await this.volumeService.updateStrategyLastTradingAttemptById(
      strategyId,
      date,
    );
  }

  private async updateStrategyPausedReasonById(id: number, reason: string) {
    return await this.volumeService.updateStrategyPausedReasonById(id, reason);
  }

  private async cancelStrategyOrders(
    strategyEntity: VolumeStrategyData,
    pair: string,
  ): Promise<void> {
    await this.tradeService.cancelUnfilledOrders(
      strategyEntity.exchangeName,
      pair,
      strategyEntity.userId,
    );
  }
  private async cancelAllOrdersOnExchange(exchangeInstance: any, strategyEntity: VolumeStrategyData, pair: string,
  ) {
    await this.tradeService.cancelAllOrdersOnExchange(exchangeInstance, 
      pair,
    strategyEntity.userId);
  }

  async executeVolumeStrategy(data: VolumeStrategyData): Promise<void> {
    const now = new Date();
    const {
      userId,
      id,
      exchangeName,
      sideA,
      sideB,
      amountToTrade,
      incrementPercentage,
      tradeIntervalSeconds,
      numTotalTrades,
      pricePushRate,
      tradesExecuted = 0,
      currentMakerPrice = null,
      lastTradingAttemptAt,
      clientId,
    } = data;

    const pair = buildPair(sideA, sideB);

    if (
      this.shouldWaitBeforeNextTrade(
        now,
        lastTradingAttemptAt,
        tradeIntervalSeconds,
      )
    ) {
      const nextTime = new Date(
        lastTradingAttemptAt!.getTime() + tradeIntervalSeconds * 1000,
      );
      this.logger.debug(
        `Strategy ${id} for ${sideA}/${sideB} not executed: waiting until ${nextTime.toISOString()}.`,
      );
      return;
    }

    if (tradesExecuted >= numTotalTrades) {
      await this.finishStrategy(id, userId, clientId, pair, numTotalTrades);
      return;
    }

    try {
      const [defaultAccount, additionalAccount] =
        await this.loadExchangeAccounts(exchangeName, userId);
      const orderBook = await defaultAccount.fetchOrderBook(pair);

      if (!orderBook.bids.length || !orderBook.asks.length) {
        return await this.pauseStrategyDueToOrderBook(id, pair);
      }

      await this.cancelAllOrdersOnExchange(defaultAccount, data, pair);
      await this.cancelAllOrdersOnExchange(additionalAccount, data, pair);


      const bestBid = orderBook.bids[0][0];
      const bestAsk = orderBook.asks[0][0];

      const useAccount1AsMaker = tradesExecuted % 2 === 0;
      const makerExchange = useAccount1AsMaker
        ? defaultAccount
        : additionalAccount;
      const takerExchange = useAccount1AsMaker
        ? additionalAccount
        : defaultAccount;

      const tradeAmount = this.calculateTradeAmount(amountToTrade);
      const midPrice = (bestBid + bestAsk) / 2;
      const newMakerPrice = this.calculateMakerPrice(
        bestBid,
        bestAsk
      );

      await this.rebalance(
        makerExchange,
        takerExchange,
        pair,
        tradeAmount,
        midPrice,
      );

      await this.placeOrders(
        pair,
        makerExchange,
        takerExchange,
        tradeAmount,
        newMakerPrice,
      );
      this.logger.log(`Best bid: ${bestBid}, best ask: ${bestAsk} for ${pair}`);

      await this.volumeService.updateStrategyAfterTrade(id, {
        tradesExecuted: tradesExecuted + 1,
        currentMakerPrice: newMakerPrice,
      });

      await this.updateStrategyLastTradingAttempt(id, now);
    } catch (error) {
      await this.handleTradeError(id, error);
    }
  }

  private shouldWaitBeforeNextTrade(
    now: Date,
    lastTradingAttemptAt: Date | null | undefined,
    tradeIntervalSeconds: number,
  ): boolean {
    if (!lastTradingAttemptAt) return false;
    const nextAllowedTime = new Date(
      lastTradingAttemptAt.getTime() + tradeIntervalSeconds * 1000,
    );
    return now < nextAllowedTime;
  }

  private async loadExchangeAccounts(exchangeName: string, userId: string) {
    return Promise.all([
      this.exchangeRegistryService.getExchangeByName({
        exchangeName,
        strategy: this.defaultStrategy,
        userId,
      }),
      this.exchangeRegistryService.getExchangeByName({
        exchangeName,
        strategy: this.additionalAccountStrategy,
        userId,
      }),
    ]);
  }

  private async finishStrategy(
    id: number,
    userId: string,
    clientId: string,
    pair: string,
    numTotalTrades: number,
  ) {
    await this.delete({ id, userId, clientId });
    this.logger.log(
      `Volume strategy ${id} for ${pair} has completed all ${numTotalTrades} trades.`,
    );
  }

  private async pauseStrategyDueToOrderBook(id: number, pair: string) {
    const errorMsg = `Incomplete order book data for ${pair}`;
    this.logger.error(errorMsg);
    await this.updateStrategyStatusById(id, StrategyInstanceStatus.PAUSED);
    await this.updateStrategyPausedReasonById(id, errorMsg);
    this.logger.warn(`Paused strategy ${id} due to: ${errorMsg}`);
  }

  private calculateTradeAmount(baseAmount: Decimal): Decimal {
    const randomFactor = 1 + (Math.random() * 0.1 - 0.05);
    return baseAmount.mul(randomFactor);
  }

  private calculateMakerPrice(
    bestBid: number,
    bestAsk: number,
  ): number {
    return bestBid + Math.random() * (bestAsk - bestBid);
  }

  private async placeOrders(
    pair: string,
    makerExchange: any,
    takerExchange: any,
    tradeAmount: Decimal,
    price: number,
  ) {
    await Promise.all([
      makerExchange.createOrder(
        pair,
        MarketOrderType.LIMIT_ORDER,
        TradeSideType.BUY,
        tradeAmount,
        price,
        { postOnly: true },
      ),
      takerExchange.createOrder(
        pair,
        MarketOrderType.LIMIT_ORDER,
        TradeSideType.SELL,
        tradeAmount,
        price,
      ),
    ]);
  }
  private async rebalance(
    makerExchange: any,
    takerExchange: any,
    pair: string,
    tradeAmount: Decimal,
    midPrice: number,
  ) {
    const [makerBalances, takerBalances] = await Promise.all([
      this.getFree(makerExchange, pair.split('/')[0], pair.split('/')[1]),
      this.getFree(takerExchange, pair.split('/')[0], pair.split('/')[1]),
    ]);
      /* maker side sufficient? */
      if (
        makerBalances.quote < tradeAmount.mul(midPrice).mul(1.01)
      ) {
        const deficitBase = tradeAmount.mul(midPrice).sub(makerBalances.quote).div(midPrice);
        await this.executeRebalance(makerExchange, TradeSideType.SELL, pair, deficitBase, midPrice);
      } 

      /* taker side sufficient? */
      if (takerBalances.base < tradeAmount.mul(1.01)) {
        const deficitQuote = tradeAmount.sub(takerBalances.base);
        await this.executeRebalance(takerExchange, TradeSideType.BUY, pair, deficitQuote, midPrice);
      }
  }

  private async executeRebalance(
    exch: any,
    side: TradeSideType,
    pair: string,
    amountNeeded: Decimal,
    price: number,
  ) {
    if (side === TradeSideType.BUY) {
      /* need more base, so buy base with quote */
      if (amountNeeded.gt(0)) {
        //The minimum transaction volume cannot be less than：1USDT
        const tempPrice = price * 0.90;
        const amount = (amountNeeded.mul(tempPrice).gte(1)) ? amountNeeded : new Decimal(1).div(tempPrice);
        await exch.createOrder(pair, MarketOrderType.MARKET_ORDER, TradeSideType.BUY, amount, price);
    }} else {
      /* need more quote, so sell base for quote */
      const baseToSell = amountNeeded.div(price);
      if (baseToSell.gt(0)) {
        const tempPrice = price * 1.1;
        const amount = (baseToSell.mul(tempPrice).gte(1)) ? baseToSell : new Decimal(1).div(tempPrice);
        await exch.createOrder(pair, MarketOrderType.MARKET_ORDER, TradeSideType.SELL, amount, price);
      }

    }
  }

  private async getFree(
    exch: any,
    base: string,
    quote: string,
  ) {
    const bal = await exch.fetchBalance();
    return {
      base: bal.free[base] ?? 0,
      quote: bal.free[quote] ?? 0,
    };
  }



  private async handleTradeError(id: number, error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.logger.error(`Error executing trade: ${error.stack || error}`);
    this.logger.error(
      `Failed executing trade for strategy ${id}: ${errorMessage}`,
    );
    await this.updateStrategyStatusById(id, StrategyInstanceStatus.PAUSED);
    await this.updateStrategyPausedReasonById(id, errorMessage);
  }
}
