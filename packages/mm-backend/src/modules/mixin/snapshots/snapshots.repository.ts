import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Snapshot } from '../../../common/entities/snapshots.entity';

@Injectable()
export class SnapshotsRepository {
  constructor(
    @InjectRepository(Snapshot)
    private readonly repository: Repository<Snapshot>,
  ) {}

  async checkSnapshotExist(snapshot_id: string): Promise<boolean> {
    return this.repository.exists({ where: { snapshot_id } });
  }

  async createSnapshot(transactionData: Partial<Snapshot>): Promise<Snapshot> {
    const transaction = this.repository.create(transactionData);
    return this.repository.save(transaction);
  }
}
