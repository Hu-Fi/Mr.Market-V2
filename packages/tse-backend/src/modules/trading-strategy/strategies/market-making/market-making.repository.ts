import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StrategyMarketMaking } from '../../../../common/entities/strategy-market-making.entity';
import { Not, Repository } from 'typeorm';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';

@Injectable()
export class MarketMakingRepository {
  constructor(
    @InjectRepository(StrategyMarketMaking)
    private readonly repository: Repository<StrategyMarketMaking>,
  ) {}

  async createStrategy(
    strategy: Partial<StrategyMarketMaking>,
  ): Promise<StrategyMarketMaking> {
    return this.repository.save(strategy);
  }

  async updateStrategyStatusById(id: number, newState: StrategyInstanceStatus) {
    return await this.repository.update({ id }, { status: newState });
  }

  async updateStrategyPausedReasonById(id: number, newReason: string) {
    return await this.repository.update({ id }, { pausedReason: newReason });
  }

  async updateStrategyLastTradingAttemptById(id: number, newDate: Date) {
    return await this.repository.update(
      { id },
      { lastTradingAttemptAt: newDate },
    );
  }

  async findRunningStrategies(): Promise<StrategyMarketMaking[]> {
    return this.repository.find({
      where: { status: StrategyInstanceStatus.RUNNING },
    });
  }

  async findStrategyById(
    id: number,
    options?: any,
  ): Promise<StrategyMarketMaking> {
    return this.repository.findOne({
      where: { id, ...options },
    });
  }

  async findStrategiesByUserId(
    userId: string,
  ): Promise<StrategyMarketMaking[]> {
    return this.repository.find({
      where: { userId: userId, status: Not(StrategyInstanceStatus.DELETED) },
    });
  }
}
