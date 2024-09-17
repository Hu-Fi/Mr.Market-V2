import { Injectable, Logger } from '@nestjs/common';
import { ArbitrageStrategy } from '../trading-strategy/strategies/arbitrage/arbitrage.strategy';
import { MarketMakingStrategy } from '../trading-strategy/strategies/market-making/market-making.strategy';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { ArbitrageService } from '../trading-strategy/strategies/arbitrage/arbitrage.service';
import { MarketMakingService } from '../trading-strategy/strategies/market-making/market-making.service';
import { ConfigService } from '@nestjs/config';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';

@Injectable()
export class ExecutionWorkerService {
  private logger = new Logger(ExecutionWorkerService.name);
  private isJobRunning: boolean = false;

  constructor(
    private readonly arbitrageService: ArbitrageService,
    private readonly arbitrageStrategy: ArbitrageStrategy,
    private readonly marketMakingService: MarketMakingService,
    private readonly marketMakingStrategy: MarketMakingStrategy,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly schedulerUtils: SchedulerUtil,
  ) {}

  onModuleInit() {
    this.schedulerUtils.addCronJob(
      ExecutionWorkerService.name,
      this.configService.get<string>(
        'CRON_EXPRESSION',
        CronExpression.EVERY_30_SECONDS,
      ),
      this.handleCron.bind(this),
      this.schedulerRegistry,
    );
  }

  private async processData() {
    this.logger.debug('Strategy Execution Worker started');
    try {
      const arbitrageStrategies =
        await this.arbitrageService.findRunningStrategies();
      await this.arbitrageStrategy.start(arbitrageStrategies);
    } catch (error) {
      this.logger.error('Error executing arbitrage strategies', error.stack);
    }

    try {
      const marketMakingStrategies =
        await this.marketMakingService.findRunningStrategies();
      await this.marketMakingStrategy.start(marketMakingStrategies);
    } catch (error) {
      this.logger.error(
        'Error executing market making strategies',
        error.stack,
      );
    }
  }

  async handleCron() {
    if (this.isJobRunning) {
      this.logger.warn('Job still running, skipping');
      return;
    }
    this.isJobRunning = true;
    try {
      await this.processData();
    } catch (error) {
      this.logger.error('Error processing data', error.stack);
    } finally {
      this.isJobRunning = false;
    }
  }
}
