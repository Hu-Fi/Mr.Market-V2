import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Strategy } from '../../strategy.interface';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import {
  AlpacaStrategyActionCommand,
  AlpacaStrategyCommand,
  AlpacaStrategyData,
} from './model/alpaca.model';
import { TradeSideType } from '../../../../common/enums/exchange-operation.enums';
import {
  DerivativeType,
  StrategyInstanceStatus,
} from '../../../../common/enums/strategy-type.enums';
import { AlpacaService } from './alpaca.service';
import { ExchangeDataService } from '../../../exchange-data/exchange-data.service';
import { Decimal } from 'decimal.js';
import {
  buildPair,
  calculateProfitLoss,
  calculateVWAPForAmount,
  getFee,
  isExchangeSupported,
  isPairSupported,
} from '../../../../common/utils/trading-strategy.utils';

@Injectable()
export class AlpacaStrategy implements Strategy {
  private logger = new Logger(AlpacaStrategy.name);

  private static ERROR_MESSAGES = {
    EXCHANGE_NOT_SUPPORTED: (exchange: string) =>
      `Exchange ${exchange} is not supported`,
    SYMBOL_NOT_SUPPORTED: (symbol: string, exchange: string) =>
      `Symbol ${symbol} is not supported on exchange ${exchange}`,
    STRATEGY_NOT_FOUND: 'Alpaca strategy not found',
  };

  constructor(
    private readonly exchangeDataService: ExchangeDataService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly tradeService: ExchangeTradeService,
    private readonly alpacaService: AlpacaService,
  ) {}

  async create(command: AlpacaStrategyCommand): Promise<void> {
    await this.validateExchangesAndPairs(command);

    await this.alpacaService.createStrategy({
      ...command,
      status: StrategyInstanceStatus.RUNNING,
    });
    this.logger.debug('Created alpaca strategy with status RUNNING');
  }

  async start(strategies: AlpacaStrategyData[]): Promise<void> {
    this.logger.debug(
      `Amount of active alpaca strategies: ${strategies.length}`,
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

  async attemptEvaluation(strategy: AlpacaStrategyData) {
    try {
      await Promise.all([
        this.executeAlpacaStrategy(strategy),
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

  async pause(command: AlpacaStrategyActionCommand): Promise<void> {
    const strategyEntity = await this.getStrategyEntity(command.id, {
      userId: command.userId,
      clientId: command.clientId,
    });
    if (strategyEntity.status === StrategyInstanceStatus.RUNNING) {
      await this.updateStrategyStatusById(
        strategyEntity.id,
        StrategyInstanceStatus.PAUSED,
      );
      this.logger.debug('Paused alpaca strategy');
      await this.updateStrategyPausedReasonById(
        strategyEntity.id,
        'Manually paused by user',
      );
    }
  }

  async stop(command: AlpacaStrategyActionCommand): Promise<void> {
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
      'Stopped alpaca strategy, not filled orders have been canceled',
    );
  }

  async delete(command: AlpacaStrategyActionCommand): Promise<void> {
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

    this.logger.debug('Soft deleted alpaca strategy');
  }

  private async validateExchangesAndPairs(
    command: AlpacaStrategyCommand,
  ): Promise<void> {
    const { userId, exchangeName, sideA, sideB } = command;

    await Promise.all([
      this.validateExchange('alpaca', userId),
      this.validateExchange(exchangeName, userId),
    ]);

    await Promise.all([
      this.validatePair(sideA, 'alpaca'),
      this.validatePair(sideB, exchangeName),
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
        AlpacaStrategy.ERROR_MESSAGES.EXCHANGE_NOT_SUPPORTED(exchangeName),
      );
    }
  }

  private async validatePair(
    symbol: string,
    exchangeName: string,
  ): Promise<void> {
    const supportedSymbols =
      await this.exchangeDataService.getSupportedPairs(exchangeName);
    if (!isPairSupported(symbol, supportedSymbols)) {
      throw new NotFoundException(
        AlpacaStrategy.ERROR_MESSAGES.SYMBOL_NOT_SUPPORTED(
          symbol,
          exchangeName,
        ),
      );
    }
  }

  private async getStrategyEntity(
    strategyId: number,
    options?: any,
  ): Promise<AlpacaStrategyData> {
    const strategyEntity = await this.alpacaService.findStrategyById(
      strategyId,
      options,
    );
    if (!strategyEntity) {
      throw new NotFoundException(
        AlpacaStrategy.ERROR_MESSAGES.STRATEGY_NOT_FOUND,
      );
    }
    return strategyEntity;
  }

  private async updateStrategyStatusById(
    strategyId: number,
    status: StrategyInstanceStatus,
  ): Promise<void> {
    await this.alpacaService.updateStrategyStatusById(strategyId, status);
  }

  private async updateStrategyLastTradingAttempt(
    strategyId: number,
    date: Date,
  ) {
    await this.alpacaService.updateStrategyLastTradingAttemptById(
      strategyId,
      date,
    );
  }

  private async updateStrategyPausedReasonById(id: number, reason: string) {
    return await this.alpacaService.updateStrategyPausedReasonById(id, reason);
  }

  private async cancelStrategyOrders(
    strategyEntity: AlpacaStrategyData,
    pair: string,
  ): Promise<void> {
    await Promise.all([
      this.tradeService.cancelUnfilledOrders(
        'alpaca',
        pair,
        strategyEntity.userId,
      ),
      this.tradeService.cancelUnfilledOrders(
        strategyEntity.exchangeName,
        pair,
        strategyEntity.userId,
      ),
    ]);
  }

  private async getVWAPPrice(
    userId: string,
    exchangeName: string,
    symbol: string,
    amount: Decimal,
    direction: TradeSideType,
  ): Promise<Decimal> {
    const exchange = await this.exchangeRegistryService.getExchangeByName({
      exchangeName,
      userId,
    });
    const orderBook = await exchange.fetchOrderBook(symbol);
    return calculateVWAPForAmount(orderBook, amount, direction);
  }

  private async executeFuturesArbitrage(strategy: AlpacaStrategyData) {
    await this.executeFuturesOptionsArbitrage(strategy);
  }

  private async executeOptionsArbitrage(strategy: AlpacaStrategyData) {
    await this.executeFuturesOptionsArbitrage(strategy); // TODO: align to requirements
  }

  private async executeFuturesOptionsArbitrage(strategy: AlpacaStrategyData) {
    const {
      exchangeName,
      sideA,
      sideB,
      amountToTrade,
      minProfitability,
      userId,
      clientId,
    } = strategy;

    const [spotVWAP, derivativeVWAP] = await Promise.all([
      this.getVWAPPrice(
        userId,
        'alpaca',
        sideA,
        amountToTrade,
        TradeSideType.BUY,
      ),
      this.getVWAPPrice(
        userId,
        exchangeName,
        sideB,
        amountToTrade,
        TradeSideType.SELL,
      ),
    ]);

    const profitMargin = derivativeVWAP.minus(spotVWAP).div(spotVWAP);
    this.logger.debug(
      `Strategy [${strategy.id}] [Futures/Options Arbitrage] Profit Margin: ${profitMargin.times(100).toFixed(4)}%`,
    );

    const minProfitabilityDecimal = new Decimal(minProfitability);

    if (profitMargin.abs().greaterThanOrEqualTo(minProfitabilityDecimal)) {
      const buyExchange = profitMargin.greaterThan(0)
        ? { name: 'alpaca' }
        : { name: exchangeName };
      const sellExchange = profitMargin.greaterThan(0)
        ? { name: exchangeName }
        : { name: 'alpaca' };
      const symbol = profitMargin.greaterThan(0) ? sideA : sideB;
      const buyVWAP = profitMargin.greaterThan(0) ? spotVWAP : derivativeVWAP;
      const sellVWAP = profitMargin.greaterThan(0) ? derivativeVWAP : spotVWAP;

      const tradeResult = await this.executeArbitrageTrades(
        userId,
        clientId,
        buyExchange,
        sellExchange,
        symbol,
        amountToTrade,
        buyVWAP.toNumber(),
        sellVWAP.toNumber(),
      );

      if (tradeResult && tradeResult.gt(0)) {
        this.logger.debug(
          `Executed futures/options arbitrage: User ${userId}, Symbol ${symbol}, Buy on ${buyExchange.name} at ${buyVWAP}, Sell on ${sellExchange.name} at ${sellVWAP}. Profit: ${tradeResult}`,
        );
      }
    } else {
      this.logger.debug(
        `Strategy [${strategy.id}] [Futures/Options] No profitable arbitrage found.`,
      );
    }
  }

  private async executeAlpacaStrategy(strategy: AlpacaStrategyData) {
    const { exchangeName, derivativeType } = strategy;

    if (derivativeType === DerivativeType.FUTURE) {
      await this.executeFuturesArbitrage(strategy);
      return;
    }

    if (derivativeType === DerivativeType.OPTION) {
      await this.executeOptionsArbitrage(strategy);
      return;
    }

    const { sideA, sideB, amountToTrade, minProfitability, userId, clientId } =
      strategy;

    const [alpacaVWAP, derivativeVWAP] = await Promise.all([
      this.getVWAPPrice(
        userId,
        'alpaca',
        sideA,
        amountToTrade,
        TradeSideType.BUY,
      ),
      this.getVWAPPrice(
        userId,
        exchangeName,
        sideB,
        amountToTrade,
        TradeSideType.SELL,
      ),
    ]);
    const spotPrice = alpacaVWAP;
    const derivativePrice = derivativeVWAP;

    const profitMargin = derivativePrice.minus(spotPrice).div(spotPrice);
    this.logger.debug(
      `Strategy [${strategy.id}] [Spot Arbitrage] Profit Margin (VWAP): ${profitMargin.times(100).toFixed(4)}%`,
    );

    const minProfitabilityDecimal = new Decimal(minProfitability);

    if (profitMargin.abs().greaterThanOrEqualTo(minProfitabilityDecimal)) {
      const buyExchange = profitMargin.greaterThan(0)
        ? { name: 'alpaca' }
        : { name: exchangeName };
      const sellExchange = profitMargin.greaterThan(0)
        ? { name: exchangeName }
        : { name: 'alpaca' };
      const buyPrice = profitMargin.greaterThan(0)
        ? spotPrice.toNumber()
        : derivativePrice.toNumber();
      const sellPrice = profitMargin.greaterThan(0)
        ? derivativePrice.toNumber()
        : spotPrice.toNumber();
      const symbol = profitMargin.greaterThan(0) ? sideA : sideB;

      const tradeResult = await this.executeArbitrageTrades(
        userId,
        clientId,
        buyExchange,
        sellExchange,
        symbol,
        amountToTrade,
        buyPrice,
        sellPrice,
      );

      if (tradeResult && tradeResult.gt(0)) {
        this.logger.debug(
          `Executed alpaca spot arbitrage: User ${userId}, Symbol ${symbol}, Buy on ${buyExchange.name} at ${buyPrice}, Sell on ${sellExchange.name} at ${sellPrice}. Profit: ${tradeResult}`,
        );
      }
    } else {
      this.logger.debug(
        `Strategy [${strategy.id}] No profitable arbitrage found.`,
      );
    }
  }

  private async executeArbitrageTrades(
    userId: string,
    clientId: string,
    buyExchange: any,
    sellExchange: any,
    symbol: string,
    amount: Decimal,
    buyPrice: number,
    sellPrice: number,
  ): Promise<Decimal | null> {
    try {
      const [buyOrder, sellOrder] = await Promise.all([
        this.tradeService.executeLimitTrade({
          userId,
          clientId,
          exchange: buyExchange.name,
          symbol,
          side: TradeSideType.BUY,
          amount,
          price: buyPrice,
        }),
        this.tradeService.executeLimitTrade({
          userId,
          clientId,
          exchange: sellExchange.name,
          symbol,
          side: TradeSideType.SELL,
          amount,
          price: sellPrice,
        }),
      ]);

      const buyFee = getFee(buyOrder);
      const sellFee = getFee(sellOrder);
      return calculateProfitLoss(buyPrice, sellPrice, amount, buyFee, sellFee);
    } catch (error) {
      this.logger.error(`Failed to execute arbitrage trade: ${error.message}`);
      return null;
    }
  }
}
