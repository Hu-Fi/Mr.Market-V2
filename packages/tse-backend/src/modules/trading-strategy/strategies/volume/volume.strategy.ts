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
    const strategyEntity = await this.getStrategyEntity(command.id);
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
    const strategyEntity = await this.getStrategyEntity(command.id);
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
    const strategyEntity = await this.getStrategyEntity(command.id);
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
    const { exchangeName, sideA, sideB } = command;
    const pair = `${sideA}/${sideB}:${sideB}`;
    await Promise.all([
      this.validatePair(pair, exchangeName),
      this.validateExchange(exchangeName),
    ]);
  }

  private async validateExchange(exchangeName: string): Promise<void> {
    await this.exchangeRegistryService.getExchangeByName(exchangeName);
    const supportedExchanges = await this.exchangeRegistryService.getSupportedExchanges();
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
  ): Promise<VolumeStrategyData> {
    const strategyEntity =
      await this.volumeService.findStrategyById(strategyId);
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
    return await this.volumeService.updateStrategyPausedReasonById(
      id,
      reason,
    );
  }

  private async cancelStrategyOrders(
    strategyEntity: VolumeStrategyData,
    pair: string,
  ): Promise<void> {
    await this.tradeService.cancelUnfilledOrders(
      strategyEntity.exchangeName,
      pair,
    );
  }

  async executeVolumeStrategy(command: VolumeStrategyCommand): Promise<void> {
    // const {
    //   userId,
    //   clientId,
    //   exchangeName,
    //   sideA,
    //   sideB,
    //   amountToTrade,
    //   tradeIntervalSeconds,
    //   numTotalTrades,
    //   pricePushRate
    // } = command;
    //
    // const exchange =
    //   await this.exchangeRegistryService.getExchangeByName(exchangeName);
    //
    // const pair = `${sideA}/${sideB}`;
    //
    // const orderBook = await exchange.fetchOrderBook(pair);

  }
}
