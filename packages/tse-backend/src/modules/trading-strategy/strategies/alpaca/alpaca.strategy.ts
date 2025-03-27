import { Injectable, Logger } from '@nestjs/common';
import { Strategy } from '../../strategy.interface';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import {
  AlpacaStrategyActionCommand,
  AlpacaStrategyCommand,
  AlpacaStrategyData,
} from './model/alpaca.model';
import {
  TradeSideType,
} from '../../../../common/enums/exchange-operation.enums';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';
import { AlpacaService } from './alpaca.service';
import { ExchangeDataService } from '../../../exchange-data/exchange-data.service';
import { GetDefaultAccountStrategy } from '../../../exchange-registry/exchange-manager/strategies/get-default-account.strategy';
import { GetAdditionalAccountStrategy } from '../../../exchange-registry/exchange-manager/strategies/get-additional-account.strategy';

@Injectable()
export class AlpacaStrategy implements Strategy {
  private logger = new Logger(AlpacaStrategy.name);

  constructor(
    private readonly exchangeDataService: ExchangeDataService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly tradeService: ExchangeTradeService,
    private readonly alpacaService: AlpacaService,
    private readonly defaultStrategy: GetDefaultAccountStrategy,
    private readonly additionalAccountStrategy: GetAdditionalAccountStrategy,
  ) {}

  async create(command: AlpacaStrategyCommand): Promise<void> {
    await this.alpacaService.createStrategy({
      ...command,
      status: StrategyInstanceStatus.RUNNING,
    });
    this.logger.log(`Strategy created successfully with status RUNNING.`);
  }

  async start(strategies: AlpacaStrategyData[]): Promise<void> {
    this.logger.debug(`Starting Alpaca strategies: ${strategies.length}`);

    for (const strategy of strategies.filter(
      (s) => s.status === StrategyInstanceStatus.RUNNING,
    )) {
      try {
        await this.executeAlpacaStrategy(strategy);
        await this.alpacaService.updateStrategyLastTradingAttemptById(
          strategy.id,
          new Date(),
        );
      } catch (error) {
        this.logger.error(
          `Error running strategy [${strategy.id}]: ${error.message}`,
        );
        await this.alpacaService.updateStrategyStatusById(
          strategy.id,
          StrategyInstanceStatus.PAUSED,
        );
        await this.alpacaService.updateStrategyPausedReasonById(
          strategy.id,
          error.message,
        );
      }
    }
  }

  async stop(command: AlpacaStrategyActionCommand): Promise<void> {
    await this.alpacaService.updateStrategyStatusById(
      command.id,
      StrategyInstanceStatus.STOPPED,
    );
    this.logger.log(`Strategy [${command.id}] stopped successfully.`);
  }

  private async executeAlpacaStrategy(strategy: AlpacaStrategyData) {
    const { exchangeName, sideA, sideB, amountToTrade, minProfitability } = strategy;

    const alpacaExchange = await this.exchangeRegistryService.getExchangeByName(
      'alpaca',
      this.defaultStrategy,
    );
    const derivativeExchange = await this.exchangeRegistryService.getExchangeByName(
      exchangeName,
      this.additionalAccountStrategy,
    );

    const [alpacaTicker, derivativeTicker] = await Promise.all([
      this.exchangeDataService.getTickerPrice({ exchange: 'alpaca', symbol: sideA }),
      this.exchangeDataService.getTickerPrice({ exchange: exchangeName, symbol: sideB }),
    ]);

    const spotPrice = alpacaTicker.price;
    const derivativePrice = derivativeTicker.price;

    const profitMargin = (derivativePrice - spotPrice) / spotPrice;
    this.logger.log(
      `Strategy [${strategy.id}] Profit Margin: ${(profitMargin * 100).toFixed(4)}%`,
    );

    if (Math.abs(profitMargin) >= minProfitability) {
      const buyExchange =
        derivativePrice > spotPrice ? alpacaExchange : derivativeExchange;
      const sellExchange =
        derivativePrice > spotPrice ? derivativeExchange : alpacaExchange;

      const buyPrice = derivativePrice > spotPrice ? spotPrice : derivativePrice;
      const sellPrice = derivativePrice > spotPrice ? derivativePrice : spotPrice;

      await this.executeArbitrageTrades(
        strategy,
        buyExchange.name,
        sellExchange.name,
        sideA,
        amountToTrade,
        buyPrice,
        sellPrice,
      );
    } else {
      this.logger.log(`Strategy [${strategy.id}] No profitable arbitrage found.`);
    }
  }

  private async executeArbitrageTrades(
    strategy: AlpacaStrategyData,
    buyExchange: string,
    sellExchange: string,
    symbol: string,
    amount: number,
    buyPrice: number,
    sellPrice: number,
  ) {
    this.logger.log(
      `Executing arbitrage for strategy [${strategy.id}]: BUY on ${buyExchange}, SELL on ${sellExchange}`,
    );

    try {
      await Promise.all([
        this.tradeService.executeLimitTrade({
          userId: null,
          clientId: null,
          exchange: buyExchange,
          symbol,
          side: TradeSideType.BUY,
          amount,
          price: buyPrice,
        }),
        this.tradeService.executeLimitTrade({
          userId: null,
          clientId: null,
          exchange: sellExchange,
          symbol,
          side: TradeSideType.SELL,
          amount,
          price: sellPrice,
        }),
      ]);

      this.logger.log(
        `Arbitrage Trades executed successfully for strategy [${strategy.id}]: BUY - ${buyExchange} at ${buyPrice}, SELL - ${sellExchange} at ${sellPrice}`,
      );

      await this.alpacaService.updateStrategyAfterTrade(strategy.id, {
        tradesExecuted: 1,
        currentMakerPrice: sellPrice,
      });
    } catch (error) {
      this.logger.error(
        `Trade execution error for strategy [${strategy.id}]: ${error.message}`,
      );
      throw error;
    }
  }

  async pause(command: AlpacaStrategyActionCommand): Promise<void> {
    await this.alpacaService.updateStrategyStatusById(
      command.id,
      StrategyInstanceStatus.PAUSED,
    );
    this.logger.log(`Strategy [${command.id}] paused successfully.`);
  }
}