import { CustomLogger } from '../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ArbitrageService } from '../trading-strategy/strategies/arbitrage/arbitrage.service';
import { MarketMakingService } from '../trading-strategy/strategies/market-making/market-making.service';

@Injectable()
export class StrategiesHealthService {
  private readonly logger = new CustomLogger(StrategiesHealthService.name);
  constructor(
    private readonly arbitrageService: ArbitrageService,
    private readonly marketMakingService: MarketMakingService,
  ) {}

  async checkStrategies() {
    this.logger.debug('Checking number of strategies running health...');

    const arbitrageStrategies = await this.arbitrageService.findRunningStrategies();
    const marketMakingStrategies = await this.marketMakingService.findRunningStrategies();

    return {
      arbitrageStrategiesCount: arbitrageStrategies.length,
      marketMakingStrategiesCount: marketMakingStrategies.length,
    }
  }
}
