import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Strategy } from '../../strategy.interface';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import {
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyCommand,
  ArbitrageStrategyData,
} from './model/arbitrage.dto';
import {
  calculateProfitLoss,
  calculateVWAPForAmount,
  getFee,
  isArbitrageOpportunityBuyOnA,
  isArbitrageOpportunityBuyOnB,
  isExchangeSupported,
  isPairSupported,
} from '../../../../common/utils/trading-strategy.utils';
import { TradeSideType } from '../../../../common/enums/exchange-operation.enums';
import { ArbitrageTradeParams } from '../../../../common/interfaces/trading-strategy.interfaces';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';
import { ArbitrageService } from './arbitrage.service';
import { ExchangeDataService } from '../../../exchange-data/exchange-data.service';

@Injectable()
export class ArbitrageStrategy implements Strategy {
  private logger = new Logger(ArbitrageStrategy.name);

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
    private readonly arbitrageService: ArbitrageService,
  ) {}

  async create(command: ArbitrageStrategyCommand): Promise<void> {
    await this.validateExchangesAndPairs(command);

    await this.arbitrageService.createStrategy({
      userId: command.userId,
      clientId: command.clientId,
      sideA: command.sideA,
      sideB: command.sideB,
      amountToTrade: command.amountToTrade,
      minProfitability: command.minProfitability,
      exchangeAName: command.exchangeAName,
      exchangeBName: command.exchangeBName,
      checkIntervalSeconds: command.checkIntervalSeconds,
      maxOpenOrders: command.maxOpenOrders,
      status: StrategyInstanceStatus.RUNNING,
    });
  }

  async start(strategies: ArbitrageStrategyData[]): Promise<void> {
    this.logger.debug(
      `Amount of active arbitrage strategies: ${strategies.length}`,
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

  async attemptEvaluation(strategy: ArbitrageStrategyData) {
    try {
      await this.evaluateArbitrage(strategy);
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

  async pause(command: ArbitrageStrategyActionCommand): Promise<void> {
    const strategyEntity = await this.getStrategyEntity(command.id, {
      userId: command.userId,
      clientId: command.clientId,
    });
    if (strategyEntity.status === StrategyInstanceStatus.RUNNING) {
      await this.updateStrategyStatusById(
        strategyEntity.id,
        StrategyInstanceStatus.PAUSED,
      );
      this.logger.debug('Paused arbitrage strategy');
      await this.updateStrategyPausedReasonById(
        strategyEntity.id,
        'Manually paused by user',
      );
    }
  }

  async stop(command: ArbitrageStrategyActionCommand): Promise<void> {
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
      'Stopped arbitrage strategy, not filled orders have been canceled',
    );
  }

  async delete(command: ArbitrageStrategyActionCommand): Promise<void> {
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

    this.logger.debug('Soft deleted arbitrage strategy');
  }

  private async validateExchangesAndPairs(
    command: ArbitrageStrategyCommand,
  ): Promise<void> {
    const { userId, exchangeAName, exchangeBName, sideA, sideB } = command;

    await Promise.all([
      this.validateExchange(exchangeAName, userId),
      this.validateExchange(exchangeBName, userId),
    ]);

    const pair = `${sideA}/${sideB}:${sideB}`;
    await Promise.all([
      this.validatePair(pair, exchangeAName),
      this.validatePair(pair, exchangeBName),
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
        ArbitrageStrategy.ERROR_MESSAGES.EXCHANGE_NOT_SUPPORTED(exchangeName),
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
        ArbitrageStrategy.ERROR_MESSAGES.SYMBOL_NOT_SUPPORTED(
          altSymbol,
          exchangeName,
        ),
      );
    }
  }

  private async getStrategyEntity(
    strategyId: number,
    options?: any,
  ): Promise<ArbitrageStrategyData> {
    const strategyEntity = await this.arbitrageService.findStrategyById(
      strategyId,
      options,
    );
    if (!strategyEntity) {
      throw new NotFoundException(
        ArbitrageStrategy.ERROR_MESSAGES.STRATEGY_NOT_FOUND,
      );
    }
    return strategyEntity;
  }

  private async updateStrategyStatusById(
    strategyId: number,
    status: StrategyInstanceStatus,
  ): Promise<void> {
    await this.arbitrageService.updateStrategyStatusById(strategyId, status);
  }

  private async updateStrategyLastTradingAttempt(
    strategyId: number,
    date: Date,
  ) {
    await this.arbitrageService.updateStrategyLastTradingAttemptById(
      strategyId,
      date,
    );
  }

  private async updateStrategyPausedReasonById(id: number, reason: string) {
    return await this.arbitrageService.updateStrategyPausedReasonById(
      id,
      reason,
    );
  }

  private async cancelStrategyOrders(
    strategyEntity: ArbitrageStrategyData,
    pair: string,
  ): Promise<void> {
    await this.tradeService.cancelUnfilledOrders(
      strategyEntity.exchangeAName,
      pair,
      strategyEntity.userId,
    );
    await this.tradeService.cancelUnfilledOrders(
      strategyEntity.exchangeBName,
      pair,
      strategyEntity.userId,
    );
  }

  async evaluateArbitrage(command: ArbitrageStrategyCommand): Promise<void> {
    const {
      userId,
      clientId,
      sideA,
      sideB,
      amountToTrade,
      minProfitability,
      exchangeAName,
      exchangeBName,
    } = command;

    const exchangeA = await this.exchangeRegistryService.getExchangeByName({
      exchangeName: exchangeAName,
      userId,
    });
    const exchangeB = await this.exchangeRegistryService.getExchangeByName({
      exchangeName: exchangeBName,
      userId,
    });

    const pair = `${sideA}/${sideB}`;

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
}
