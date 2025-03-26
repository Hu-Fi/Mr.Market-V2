import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';
import { Alpaca } from '../../../../common/entities/alpaca.entity';

@Injectable()
export class AlpacaStrategyRepository {
  constructor(
    @InjectRepository(Alpaca)
    private readonly repository: Repository<Alpaca>,
  ) {}
  async createStrategy(strategy: Partial<Alpaca>): Promise<Alpaca> {
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

  async findRunningStrategies(): Promise<Alpaca[]> {
    return this.repository.findBy({ status: StrategyInstanceStatus.RUNNING });
  }

  async findLatestStrategyByUserId(userId: string): Promise<Alpaca | null> {
    return this.repository.findOne({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findStrategiesByUserId(userId: string): Promise<Alpaca[]> {
    return this.repository.find({
      where: { userId: userId, status: Not(StrategyInstanceStatus.DELETED) },
    });
  }

  async findStrategyById(id: number, options?: any): Promise<Alpaca> {
    return this.repository.findOne({
      where: { id: id, ...options },
    });
  }

  async updateStrategyAfterTrade(
    id: number,
    data: { tradesExecuted: number; currentMakerPrice: any },
  ) {
    return await this.repository.update({ id }, data);
  }
}
