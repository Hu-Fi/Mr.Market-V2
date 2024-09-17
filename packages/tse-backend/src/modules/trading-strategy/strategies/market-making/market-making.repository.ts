import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketMaking } from '../../../../common/entities/market-making.entity';
import { Repository } from 'typeorm';
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

  async findRunningStrategies(): Promise<MarketMaking[]> {
    return this.repository.find({
      where: { status: StrategyInstanceStatus.RUNNING },
    });
  }

  async findLatestStrategyByUserId(userId: string): Promise<MarketMaking> {
    return this.repository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
