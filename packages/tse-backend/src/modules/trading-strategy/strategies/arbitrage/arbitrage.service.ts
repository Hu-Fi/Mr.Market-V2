import { Injectable, Logger } from '@nestjs/common';
import { ArbitrageStrategyRepository } from './arbitrage.repository';
import { Arbitrage } from '../../../../common/entities/arbitrage.entity';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';

@Injectable()
export class ArbitrageService {
  private logger = new Logger(ArbitrageService.name);

  constructor(private readonly repository: ArbitrageStrategyRepository) {}

  async createStrategy(strategy: Partial<Arbitrage>): Promise<Arbitrage> {
    try {
      return this.repository.createStrategy(strategy);
    } catch (error) {
      this.logger.error(`Error creating arbitrage strategy: ${error.message}`);
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

  async findRunningStrategies(): Promise<Arbitrage[]> {
    try {
      return this.repository.findRunningStrategies();
    } catch (error) {
      this.logger.error(`Error finding running strategies: ${error.message}`);
      throw error;
    }
  }

  async findLatestStrategyByUserId(userId: string): Promise<Arbitrage | null> {
    try {
      return this.repository.findLatestStrategyByUserId(userId);
    } catch (error) {
      this.logger.error(
        `Error finding latest strategy for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }
}
