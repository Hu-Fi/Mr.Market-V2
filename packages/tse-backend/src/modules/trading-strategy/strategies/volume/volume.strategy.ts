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
      const newMakerPrice = this.calculateMakerPrice(
        currentMakerPrice,
        bestBid,
        bestAsk,
        incrementPercentage,
        pricePushRate,
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
    currentMakerPrice: number | null,
    bestBid: number,
    bestAsk: number,
    incrementPercentage: number,
    pricePushRate: number,
  ): number {
    let newPrice: number;

    if (currentMakerPrice === null) {
      const midPrice = (bestBid + bestAsk) / 2;
      newPrice = midPrice * (1 + incrementPercentage / 100);
    } else {
      newPrice = currentMakerPrice * (1 + pricePushRate / 100);
    }

    return Math.min(newPrice, bestAsk - 0.000001);
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

    this.logger.log(
      `Maker placing limit BUY: ${tradeAmount.toFixed(6)} ${pair} @ ${price.toFixed(6)} on ${makerExchange.id}`,
    );
    this.logger.log(
      `Taker placing limit SELL: ${tradeAmount.toFixed(6)} ${pair} @ ${price.toFixed(6)} on ${takerExchange.id}`,
    );
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
