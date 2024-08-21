import { Injectable } from '@nestjs/common';
import { Strategy } from './strategy.interface';
import {
  StrategyCommand,
  StrategyConfig,
} from '../../common/interfaces/trading-strategy.interfaces';
import { StrategyInstanceStatus } from '../../common/enums/strategy-type.enums';

@Injectable()
export class TradingStrategyService {
  private strategies: Map<string, StrategyConfig> = new Map();
  // TODO: persist strategies in the database to enable restarting after application failure

  async startStrategy(
    key: string,
    strategy: Strategy,
    command: StrategyCommand,
  ): Promise<void> {
    const existingStrategy = this.strategies.get(key);
    if (
      !existingStrategy ||
      existingStrategy.status === StrategyInstanceStatus.PAUSED
    ) {
      const intervalId = await strategy.start(command);

      this.strategies.set(key, {
        instance: strategy,
        intervalId: intervalId,
        status: StrategyInstanceStatus.RUNNING,
      } as StrategyConfig);
    }
  }

  async pauseStrategy(key: string): Promise<void> {
    const config = this.strategies.get(key);
    if (config?.instance) {
      await config.instance.pause(config.intervalId);
      config.status = StrategyInstanceStatus.PAUSED;
      this.strategies.set(key, config);
    }
  }

  async stopStrategy(key: string): Promise<void> {
    const config = this.strategies.get(key);
    if (config?.instance) {
      await config.instance.stop(config.intervalId);
      this.strategies.delete(key);
    }
  }
}
