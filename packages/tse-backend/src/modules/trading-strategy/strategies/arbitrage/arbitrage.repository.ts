import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';
import { StrategyArbitrage } from '../../../../common/entities/startegy-arbitrage.entity';

@Injectable()
export class ArbitrageStrategyRepository {
  constructor(
    @InjectRepository(StrategyArbitrage)
    private readonly repository: Repository<StrategyArbitrage>,
  ) {}
  async createStrategy(
    strategy: Partial<StrategyArbitrage>,
  ): Promise<StrategyArbitrage> {
    return this.repository.save(strategy);
  }

  async updateStrategyStatusById(id: number, newState: StrategyInstanceStatus) {
    return await this.repository.update({ id }, { status: newState });
  }

  async updateStrategyLastTradingAttemptById(id: number, newDate: Date) {
    return await this.repository.update(
      { id },
      { lastTradingAttemptAt: newDate },
    );
  }

  async updateStrategyPausedReasonById(id: number, newReason: string) {
    return await this.repository.update({ id }, { pausedReason: newReason });
  }

  async findRunningStrategies(): Promise<StrategyArbitrage[]> {
    return this.repository.findBy({ status: StrategyInstanceStatus.RUNNING });
  }

  async findStrategiesByUserId(userId: string): Promise<StrategyArbitrage[]> {
    return this.repository.find({
      where: { userId: userId, status: Not(StrategyInstanceStatus.DELETED) },
    });
  }

  async findStrategyById(
    id: number,
    options?: any,
  ): Promise<StrategyArbitrage> {
    return this.repository.findOne({
      where: { id: id, ...options },
    });
  }
}
