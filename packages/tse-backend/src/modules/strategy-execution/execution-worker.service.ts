import { Injectable, Logger } from '@nestjs/common';
import { ArbitrageStrategy } from '../trading-strategy/strategies/arbitrage/arbitrage.strategy';
import { MarketMakingStrategy } from '../trading-strategy/strategies/market-making/market-making.strategy';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArbitrageService } from '../trading-strategy/strategies/arbitrage/arbitrage.service';
import { MarketMakingService } from '../trading-strategy/strategies/market-making/market-making.service';

@Injectable()
export class ExecutionWorkerService {
  private logger = new Logger(ExecutionWorkerService.name);

  constructor(
    private readonly arbitrageService: ArbitrageService,
    private readonly arbitrageStrategy: ArbitrageStrategy,
    private readonly marketMakingService: MarketMakingService,
    private readonly marketMakingStrategy: MarketMakingStrategy
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    this.logger.debug('Strategy Execution Worker started');
    const arbitrageStrategies = await this.arbitrageService.findRunningStrategies();
    await this.arbitrageStrategy.start(arbitrageStrategies);

    const marketMakingStrategies = await this.marketMakingService.findRunningStrategies();
    await this.marketMakingStrategy.start(marketMakingStrategies);
  }
}
