import { Injectable } from '@nestjs/common';
import { TradingStrategy } from './trading-strategy.interface';
import { SpotStrategy } from './spot-strategy';
import { ArbitrageStrategy } from './arbitrage-strategy';
import { MarketMakingStrategy } from './market-making-strategy';
import { SafeSnapshot } from '@mixin.dev/mixin-node-sdk';
import { CustomLogger } from '../../../modules/logger/logger.service';
import { TradingType } from '../../enums/memo.enum';

@Injectable()
export class StrategyExecutor {
  private readonly logger = new CustomLogger(StrategyExecutor.name);
  private strategyMap: { [key in TradingType]?: TradingStrategy } = {};

  constructor(
    private readonly spotStrategy: SpotStrategy,
    private readonly arbitrageStrategy: ArbitrageStrategy,
    private readonly marketMakingStrategy: MarketMakingStrategy,
  ) {
    this.strategyMap[TradingType.SP] = this.spotStrategy;
    this.strategyMap[TradingType.AR] = this.arbitrageStrategy;
    this.strategyMap[TradingType.MM] = this.marketMakingStrategy;
  }

  executeStrategy(
    tradingType: string,
    decodedMemo: string,
    snapshot: SafeSnapshot,
  ) {
    const strategy = this.strategyMap[TradingType[tradingType]];
    if (strategy) {
      strategy.execute(decodedMemo, snapshot);
    } else {
      this.logger.debug(`No strategy for ${tradingType}`);
    }
  }
}
