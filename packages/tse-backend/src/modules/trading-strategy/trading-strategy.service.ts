import { Injectable } from '@nestjs/common';
import { Strategy } from './strategy.interface';

@Injectable()
export class TradingStrategyService {
  private strategies: Map<string, Strategy> = new Map();

  async startStrategy(
    key: string,
    strategy: Strategy,
    params: any,
  ): Promise<void> {
    if (!this.strategies.has(key)) {
      this.strategies.set(key, strategy);
      await strategy.start(params);
    }
  }

  async stopStrategy(key: string): Promise<void> {
    const strategy = this.strategies.get(key);
    if (strategy) {
      await strategy.stop();
      this.strategies.delete(key);
    }
  }

  async pauseStrategy(key: string): Promise<void> {
    const strategy = this.strategies.get(key);
    if (strategy) {
      await strategy.pause();
    }
  }
}
