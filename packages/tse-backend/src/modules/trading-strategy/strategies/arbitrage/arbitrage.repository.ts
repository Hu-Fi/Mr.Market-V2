import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findRunningStrategies(): Promise<Arbitrage[]> {
    return this.repository.findBy({ status: StrategyInstanceStatus.CREATED });
  }

  async findLatestStrategyByUserId(userId: string): Promise<Arbitrage | null> {
    return this.repository.findOne({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });
  }
}
