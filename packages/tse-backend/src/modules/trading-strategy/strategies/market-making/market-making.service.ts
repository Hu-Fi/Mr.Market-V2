import { Injectable, Logger } from '@nestjs/common';
import { MarketMakingRepository } from './market-making.repository';
import { StrategyMarketMaking } from '../../../../common/entities/strategy-market-making.entity';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';

@Injectable()
export class MarketMakingService {
  private logger = new Logger(MarketMakingService.name);

  constructor(private readonly repository: MarketMakingRepository) {}

  async createStrategy(
    strategy: Partial<StrategyMarketMaking>,
  ): Promise<StrategyMarketMaking> {
    try {
      return this.repository.createStrategy(strategy);
    } catch (error) {
      this.logger.error('Error creating market making strategy', error);
      throw error;
    }
  }

  async updateStrategyStatusById(id: number, newState: StrategyInstanceStatus) {
    try {
      await this.repository.updateStrategyStatusById(id, newState);
    } catch (error) {
      this.logger.error(
        `Error updating strategy status with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async updateStrategyPausedReasonById(id: number, newReason: string) {
    try {
      await this.repository.updateStrategyPausedReasonById(id, newReason);
    } catch (error) {
      this.logger.error(
        `Error updating strategy paused reason with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async updateStrategyLastTradingAttemptById(id: number, newDate: Date) {
    try {
      await this.repository.updateStrategyLastTradingAttemptById(id, newDate);
    } catch (error) {
      this.logger.error(
        `Error updating last trading attempt with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async findRunningStrategies(): Promise<StrategyMarketMaking[]> {
    try {
      return this.repository.findRunningStrategies();
    } catch (error) {
      this.logger.error(
        'Error finding running market making strategies',
        error,
      );
      throw error;
    }
  }

  async findStrategyById(
    id: number,
    options?: any,
  ): Promise<StrategyMarketMaking | null> {
    try {
      return this.repository.findStrategyById(id, options);
    } catch (error) {
      this.logger.error('Error finding market making strategy by od', error);
      throw error;
    }
  }
}
