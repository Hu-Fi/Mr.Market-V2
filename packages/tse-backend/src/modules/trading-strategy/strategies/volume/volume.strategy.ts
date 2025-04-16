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
  OrderStatus,
  TradeSideType,
} from '../../../../common/enums/exchange-operation.enums';

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
      await this.executeVolumeStrategy(strategy);
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

    const pair = `${strategyEntity.sideA}/${strategyEntity.sideB}`;
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

    const pair = `${strategyEntity.sideA}/${strategyEntity.sideB}`;
    await this.cancelStrategyOrders(strategyEntity, pair);

    this.logger.debug('Soft deleted volume strategy');
  }

  private async validateExchangesAndPairs(
    command: VolumeStrategyCommand,
  ): Promise<void> {
    const { userId, exchangeName, sideA, sideB } = command;
    const pair = `${sideA}/${sideB}:${sideB}`;
    await Promise.all([
      this.validatePair(pair, exchangeName),
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
    } = data;

    if (data.lastTradingAttemptAt) {
      const nextAllowedTime = new Date(
        data.lastTradingAttemptAt.getTime() + tradeIntervalSeconds * 1000,
      );
      if (now < nextAllowedTime) {
        this.logger.debug(
          `Strategy ${id} for ${sideA}/${sideB} not executed: waiting until ${nextAllowedTime.toISOString()}.`,
        );
        return;
      }
    }

    const defaultAccount = await this.exchangeRegistryService.getExchangeByName(
      {
        exchangeName,
        strategy: this.defaultStrategy,
        userId,
      },
    );
    const additionalAccount =
      await this.exchangeRegistryService.getExchangeByName({
        exchangeName,
        strategy: this.additionalAccountStrategy,
        userId,
      });
    const pair = `${sideA}/${sideB}`;

    if (tradesExecuted >= numTotalTrades) {
      this.logger.log(
        `Volume strategy ${id} for ${pair} has completed all ${numTotalTrades} trades.`,
      );
      await this.delete({ id, userId: data.userId, clientId: data.clientId });
      return;
    }

    try {
      const orderBook = await defaultAccount.fetchOrderBook(pair);
      if (!orderBook.bids.length || !orderBook.asks.length) {
        const errorMsg = `Incomplete order book data for ${pair}`;
        this.logger.error(errorMsg);
        await this.updateStrategyStatusById(id, StrategyInstanceStatus.PAUSED);
        await this.updateStrategyPausedReasonById(id, errorMsg);
        return;
      }
      const bestBid = orderBook.bids[0][0];
      const bestAsk = orderBook.asks[0][0];
      this.logger.log(`Best bid: ${bestBid}, best ask: ${bestAsk} for ${pair}`);

      const useAccount1AsMaker = tradesExecuted % 2 === 0;
      const makerExchange = useAccount1AsMaker
        ? defaultAccount
        : additionalAccount;
      const takerExchange = useAccount1AsMaker
        ? additionalAccount
        : defaultAccount;

      const randomFactor = 1 + (Math.random() * 0.1 - 0.05);
      const tradeAmount = amountToTrade * randomFactor;

      let newMakerPrice: number;
      if (currentMakerPrice == null) {
        const midPrice = (bestBid + bestAsk) / 2;
        newMakerPrice = midPrice * (1 + incrementPercentage / 100);
      } else {
        newMakerPrice = currentMakerPrice * (1 + pricePushRate / 100);
      }

      newMakerPrice = Math.min(newMakerPrice, bestAsk - 0.000001);

      this.logger.log(
        `Maker placing limit BUY: ${tradeAmount.toFixed(6)} ${pair} @ ${newMakerPrice.toFixed(6)} on ${makerExchange.id}`,
      );

      const makerOrder = await makerExchange.createOrder(
        pair,
        MarketOrderType.LIMIT_ORDER,
        TradeSideType.BUY,
        tradeAmount,
        newMakerPrice,
        { postOnly: true },
      );

      this.logger.log(
        `Taker placing limit SELL: ${tradeAmount.toFixed(6)} ${pair} @ ${newMakerPrice.toFixed(6)} on ${takerExchange.id}`,
      );
      const takerOrder = await takerExchange.createOrder(
        pair,
        MarketOrderType.LIMIT_ORDER,
        TradeSideType.SELL,
        tradeAmount,
        newMakerPrice,
      );

      const makerResult = await makerExchange.fetchOrder(makerOrder.id, pair);
      const takerResult = await takerExchange.fetchOrder(takerOrder.id, pair);

      if (
        makerResult.status === OrderStatus.CLOSED ||
        makerResult.status === OrderStatus.FILLED
      ) {
        this.logger.log(
          `Maker order on ${makerExchange.id} filled at ${newMakerPrice}`,
        );
      } else {
        this.logger.warn(
          `Maker order on ${makerExchange.id} status: ${makerResult.status}`,
        );
      }

      if (
        takerResult.status === OrderStatus.CLOSED ||
        takerResult.status === OrderStatus.FILLED
      ) {
        this.logger.log(
          `Taker order on ${takerExchange.id} filled at ${newMakerPrice}`,
        );
      } else {
        this.logger.warn(
          `Taker order on ${takerExchange.id} status: ${takerResult.status}`,
        );
      }

      const updatedTradesExecuted = tradesExecuted + 1;

      await this.volumeService.updateStrategyAfterTrade(id, {
        tradesExecuted: updatedTradesExecuted,
        currentMakerPrice: newMakerPrice,
      });

      await this.updateStrategyLastTradingAttempt(id, new Date());
    } catch (error) {
      this.logger.error(`Error executing trade: ${error.stack || error}`);

      this.logger.error(
        `Failed executing trade for strategy ${data.id}: ${error instanceof Error ? error.message : error}`,
      );
      await this.updateStrategyStatusById(
        data.id,
        StrategyInstanceStatus.PAUSED,
      );
      await this.updateStrategyPausedReasonById(
        data.id,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
