import { Injectable, Logger } from '@nestjs/common';
import { MarketMakingRepository } from './market-making.repository';
import { MarketMaking } from '../../../../common/entities/market-making.entity';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';

@Injectable()
export class MarketMakingService {
  private logger = new Logger(MarketMakingService.name);

  constructor(private readonly repository: MarketMakingRepository) {}

  async createStrategy(strategy: Partial<MarketMaking>): Promise<MarketMaking> {
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
      this.logger.error('Error updating market making strategy status', error);
      throw error;
    }
  }

  async findRunningStrategies(): Promise<MarketMaking[]> {
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

  async findLatestStrategyByUserId(
    userId: string,
  ): Promise<MarketMaking | null> {
    try {
      return this.repository.findLatestStrategyByUserId(userId);
    } catch (error) {
      this.logger.error(
        'Error finding latest market making strategy by user',
        error,
      );
      throw error;
    }
  }
}
