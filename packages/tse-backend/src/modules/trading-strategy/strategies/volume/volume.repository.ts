import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { StrategyInstanceStatus } from '../../../../common/enums/strategy-type.enums';
import { Volume } from '../../../../common/entities/volume.entity';

@Injectable()
export class VolumeStrategyRepository {
  constructor(
    @InjectRepository(Volume)
    private readonly repository: Repository<Volume>,
  ) {}
  async createStrategy(strategy: Partial<Volume>): Promise<Volume> {
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

  async findRunningStrategies(): Promise<Volume[]> {
    return this.repository.findBy({ status: StrategyInstanceStatus.CREATED });
  }

  async findLatestStrategyByUserId(userId: string): Promise<Volume | null> {
    return this.repository.findOne({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findStrategiesByUserId(userId: string): Promise<Volume[]> {
    return this.repository.find({
      where: { userId: userId, status: Not(StrategyInstanceStatus.DELETED) },
    });
  }

  async findStrategyById(id: number): Promise<Volume> {
    return this.repository.findOne({
      where: { id: id },
    });
  }

  async updateStrategyAfterTrade(id: number, data: { tradesExecuted: number, currentMakerPrice: any}) {
    return await this.repository.update({ id }, data);
  }
}
