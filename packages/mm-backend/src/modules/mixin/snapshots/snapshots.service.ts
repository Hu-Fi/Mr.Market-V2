import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { Cron } from '@nestjs/schedule';
import { CustomLogger } from '../../logger/logger.service';
import { StrategyExecutor } from '../../../common/utils/trading-dispatcher/strategy-executor';
import { SafeSnapshot } from '@mixin.dev/mixin-node-sdk';
import { SnapshotsRepository } from './snapshots.repository';

@Injectable()
export class SnapshotsService {
  private readonly logger = new CustomLogger(SnapshotsService.name);
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly strategyExecutor: StrategyExecutor,
    private readonly snapshotsRepository: SnapshotsRepository,
  ) {}

  async handleSnapshot(snapshot: SafeSnapshot) {
    const exist = await this.snapshotsRepository.checkSnapshotExist(
      snapshot.snapshot_id,
    );
    if (exist) {
      return;
    }
    if (!snapshot.memo || snapshot.memo.length === 0) {
      await this.createSnapshot(snapshot);
      this.logger.debug('snapshot has no memo or memo length is 0, return');
      return;
    }

    let hexDecodedMemo: string;
    let decodedMemo: string;
    try {
      hexDecodedMemo = Buffer.from(snapshot.memo, 'hex').toString('utf-8');
      decodedMemo = Buffer.from(hexDecodedMemo, 'base64').toString('utf-8');
    } catch (error) {
      this.logger.debug('Failed to decode memo, skipping strategy execution');
      await this.createSnapshot(snapshot);
      return;
    }
    const tradingType = decodedMemo.slice(0, 2);

    if (tradingType) {
      this.strategyExecutor.executeStrategy(tradingType, decodedMemo, snapshot);
    } else {
      this.logger.debug('Invalid trading type, skipping strategy execution');
    }

    await this.createSnapshot(snapshot);
  }

  private async createSnapshot(snapshot: SafeSnapshot) {
    return await this.snapshotsRepository.createSnapshot(snapshot);
  }

  async fetchAndProcessSnapshots() {
    const snapshots = await this.mixinGateway.fetchSafeSnapshots();

    for (const snapshot of snapshots) {
      await this.handleSnapshot(snapshot);
    }
  }

  @Cron('*/5 * * * * *') // Every 5 seconds
  async handleSnapshots(): Promise<void> {
    await this.fetchAndProcessSnapshots();
  }
}
