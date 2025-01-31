import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';
import { Arbitrage } from '../../../../common/entities/arbitrage.entity';

@Injectable()
export class ArbitrageStrategyRepository {
  constructor(
    @InjectRepository(Arbitrage)
    private readonly repository: Repository<Arbitrage>,
  ) {}
  async createStrategy(strategy: Partial<Arbitrage>): Promise<Arbitrage> {
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

  async findRunningStrategies(): Promise<Arbitrage[]> {
    return this.repository.findBy({ status: StrategyInstanceStatus.CREATED });
  }

  async findLatestStrategyByUserId(userId: string): Promise<Arbitrage | null> {
    return this.repository.findOne({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findStrategiesByUserId(userId: string): Promise<Arbitrage[]> {
    return this.repository.find({
      where: { userId: userId, status: Not(StrategyInstanceStatus.DELETED) },
    });
  }

  async findStrategyById(id: number): Promise<Arbitrage> {
    return this.repository.findOne({
      where: { id: id },
    });
  }
}
