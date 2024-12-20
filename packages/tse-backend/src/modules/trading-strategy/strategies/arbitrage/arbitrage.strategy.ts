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
  createStrategyKey,
  getFee,
  isArbitrageOpportunityBuyOnA,
  isArbitrageOpportunityBuyOnB,
  isExchangeSupported,
  isPairSupported,
} from '../../../../common/utils/trading-strategy.utils';
import { TradeSideType } from '../../../../common/enums/exchange-operation.enums';
import {
  ArbitrageTradeParams,
  StrategyConfig,
} from '../../../../common/interfaces/trading-strategy.interfaces';
import {
  StrategyInstanceStatus,
  StrategyTypeEnums,
  TimeUnit,
} from '../../../../common/enums/strategy-type.enums';
import { ArbitrageService } from './arbitrage.service';

@Injectable()
export class ArbitrageStrategy implements Strategy {
  private logger = new Logger(ArbitrageStrategy.name);
  private strategies: Map<number, StrategyConfig> = new Map();

  constructor(
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly tradeService: ExchangeTradeService,
    private readonly arbitrageService: ArbitrageService,
  ) {}

  async create(command: ArbitrageStrategyCommand): Promise<void> {
    this.validateExchangesAndPairs(command);

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
      status: StrategyInstanceStatus.CREATED,
    });
  }

  private validateExchangesAndPairs(command: ArbitrageStrategyCommand): void {
    const supportedExchanges =
      this.exchangeRegistryService.getSupportedExchanges();

    if (!isExchangeSupported(command.exchangeAName, supportedExchanges)) {
      throw new NotFoundException(
        `Exchange ${command.exchangeAName} is not supported`,
      );
    }

    if (!isExchangeSupported(command.exchangeBName, supportedExchanges)) {
      throw new NotFoundException(
        `Exchange ${command.exchangeBName} is not supported`,
      );
    }

    const supportedSymbolsExchangeA =
      this.exchangeRegistryService.getSupportedPairs(command.exchangeAName);
    const supportedSymbolsExchangeB =
      this.exchangeRegistryService.getSupportedPairs(command.exchangeBName);

    if (
      !isPairSupported(
        `${command.sideA}/${command.sideB}`,
        supportedSymbolsExchangeA,
      )
    ) {
      throw new NotFoundException(
        `Symbol ${command.sideA}/${command.sideB} is not supported on exchange ${command.exchangeAName}`,
      );
    }

    if (
      !isPairSupported(
        `${command.sideA}/${command.sideB}`,
        supportedSymbolsExchangeB,
      )
    ) {
      throw new NotFoundException(
        `Symbol ${command.sideA}/${command.sideB} is not supported on exchange ${command.exchangeBName}`,
      );
    }
  }

  async pause(command: ArbitrageStrategyActionCommand): Promise<void> {
    const strategyEntity: ArbitrageStrategyData =
      await this.arbitrageService.findLatestStrategyByUserId(command.userId);
    if (!strategyEntity) {
      throw new NotFoundException('Arbitrage strategy not found');
    }

    await this.arbitrageService.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.PAUSED,
    );
    const strategy = this.strategies.get(strategyEntity.id);
    if (strategy) {
      clearInterval(strategy.intervalId);
    }

    this.logger.debug('Paused arbitrage strategy');
  }

  async stop(command: ArbitrageStrategyActionCommand): Promise<void> {
    const strategyEntity: ArbitrageStrategyData =
      await this.arbitrageService.findLatestStrategyByUserId(command.userId);
    if (!strategyEntity) {
      throw new NotFoundException('Arbitrage strategy not found');
    }

    await this.arbitrageService.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.STOPPED,
    );

    const strategy = this.strategies.get(strategyEntity.id);
    if (strategy) {
      clearInterval(strategy.intervalId);
    }

    const exchangeA = this.exchangeRegistryService.getExchangeByName(
      strategyEntity.exchangeAName,
    );
    const exchangeB = this.exchangeRegistryService.getExchangeByName(
      strategyEntity.exchangeBName,
    );
    const pair = `${strategyEntity.sideA}/${strategyEntity.sideB}`;

    this.cancelUnfilledOrders(exchangeA, pair).then((canceledCount) => {
      this.logger.debug(
        `Cancelled ${canceledCount} unfilled orders for ${pair} on ${exchangeA.name}`,
      );
    });
    this.cancelUnfilledOrders(exchangeB, pair).then((canceledCount) => {
      this.logger.debug(
        `Cancelled ${canceledCount} unfilled orders for ${pair} on ${exchangeB.name}`,
      );
    });

    this.logger.debug(
      'Stopped arbitrage strategy, not filled orders have been canceled',
    );
  }

  async delete(command: ArbitrageStrategyActionCommand) {
    const strategyEntity: ArbitrageStrategyData =
      await this.arbitrageService.findLatestStrategyByUserId(command.userId);
    if (!strategyEntity) {
      throw new NotFoundException('Arbitrage strategy not found');
    }

    await this.arbitrageService.updateStrategyStatusById(
      strategyEntity.id,
      StrategyInstanceStatus.DELETED,
    );

    const strategy = this.strategies.get(strategyEntity.id);
    if (strategy) {
      clearInterval(strategy.intervalId);
      this.strategies.delete(strategyEntity.id);
    }

    const exchangeA = this.exchangeRegistryService.getExchangeByName(
      strategyEntity.exchangeAName,
    );
    const exchangeB = this.exchangeRegistryService.getExchangeByName(
      strategyEntity.exchangeBName,
    );
    const pair = `${strategyEntity.sideA}/${strategyEntity.sideB}`;

    this.cancelUnfilledOrders(exchangeA, pair).then((canceledCount) => {
      this.logger.debug(
        `Cancelled ${canceledCount} unfilled orders for ${pair} on ${exchangeA.name}`,
      );
    });
    this.cancelUnfilledOrders(exchangeB, pair).then((canceledCount) => {
      this.logger.debug(
        `Cancelled ${canceledCount} unfilled orders for ${pair} on ${exchangeB.name}`,
      );
    });

    this.logger.debug('Soft deleted arbitrage strategy');
  }

  async start(strategies: ArbitrageStrategyData[]): Promise<void> {
    this.logger.debug(
      `Amount of active arbitrage strategies: ${strategies.length}`,
    );

    for (const strategy of strategies) {
      if (!this.strategies.get(strategy.id)) {
        const intervalId = setInterval(async () => {
          // TODO: control opened orders
          //  quantity of unfilled orders cannot be more than strategy.maxOpenOrders
          await this.evaluateArbitrage(strategy);
        }, strategy.checkIntervalSeconds * TimeUnit.MILLISECONDS);

        const configuration: StrategyConfig = {
          strategyKey: createStrategyKey({
            type: StrategyTypeEnums.ARBITRAGE,
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

    const exchangeA =
      this.exchangeRegistryService.getExchangeByName(exchangeAName);
    const exchangeB =
      this.exchangeRegistryService.getExchangeByName(exchangeBName);

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
