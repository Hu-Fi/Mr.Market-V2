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

  async findRunningStrategies(): Promise<Arbitrage[]> {
    try {
      return this.repository.findRunningStrategies();
    } catch (error) {
      this.logger.error(`Error finding running strategies: ${error.message}`);
      throw error;
    }
  }

  async findStrategyById(id: number) {
    try {
      return this.repository.findStrategyById(id);
    } catch (error) {
      this.logger.error(`Error finding strategy by ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
