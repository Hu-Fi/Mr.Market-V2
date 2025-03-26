import { Injectable, Logger } from '@nestjs/common';
import { AlpacaStrategyRepository } from './alpaca.repository';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';
import { Alpaca } from '../../../../common/entities/alpaca.entity';

@Injectable()
export class AlpacaService {
  private logger = new Logger(AlpacaService.name);

  constructor(private readonly repository: AlpacaStrategyRepository) {}

  async createStrategy(strategy: Partial<Alpaca>): Promise<Alpaca> {
    try {
      return this.repository.createStrategy(strategy);
    } catch (error) {
      this.logger.error(`Error creating Alpaca strategy: ${error.message}`);
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

  async findRunningStrategies(): Promise<Alpaca[]> {
    try {
      return this.repository.findRunningStrategies();
    } catch (error) {
      this.logger.error(`Error finding running strategies: ${error.message}`);
      throw error;
    }
  }

  async findStrategyById(id: number, options?: any) {
    try {
      return this.repository.findStrategyById(id, options);
    } catch (error) {
      this.logger.error(`Error finding strategy by ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateStrategyAfterTrade(
    id: number,
    data: { tradesExecuted: number; currentMakerPrice: any },
  ) {
    try {
      await this.repository.updateStrategyAfterTrade(id, data);
    } catch (error) {
      this.logger.error(
        `Error updating strategy after trade: ${error.message}`,
      );
      throw error;
    }
  }
}
