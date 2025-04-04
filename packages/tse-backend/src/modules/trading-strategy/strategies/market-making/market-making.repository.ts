import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketMaking } from '../../../../common/entities/market-making.entity';
import { Not, Repository } from 'typeorm';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';

@Injectable()
export class MarketMakingRepository {
  constructor(
    @InjectRepository(MarketMaking)
    private readonly repository: Repository<MarketMaking>,
  ) {}

  async createStrategy(strategy: Partial<MarketMaking>): Promise<MarketMaking> {
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

  async findRunningStrategies(): Promise<MarketMaking[]> {
    return this.repository.find({
      where: { status: StrategyInstanceStatus.RUNNING },
    });
  }

  async findStrategyById(id: number, options?: any): Promise<MarketMaking> {
    return this.repository.findOne({
      where: { id, ...options },
    });
  }

  async findStrategiesByUserId(userId: string): Promise<MarketMaking[]> {
    return this.repository.find({
      where: { userId: userId, status: Not(StrategyInstanceStatus.DELETED) },
    });
  }
}
