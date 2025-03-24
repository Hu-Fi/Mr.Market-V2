import { Injectable, Logger } from '@nestjs/common';
import { VolumeStrategyRepository } from './volume.repository';
import { Volume } from '../../../../common/entities/volume.entity';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';

@Injectable()
export class VolumeService {
  private logger = new Logger(VolumeService.name);

  constructor(private readonly repository: VolumeStrategyRepository) {}

  async createStrategy(strategy: Partial<Volume>): Promise<Volume> {
    try {
      return this.repository.createStrategy(strategy);
    } catch (error) {
      this.logger.error(`Error creating volume strategy: ${error.message}`);
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

  async findRunningStrategies(): Promise<Volume[]> {
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
