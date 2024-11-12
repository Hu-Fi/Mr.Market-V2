import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { Transactional } from 'typeorm-transactional';
import { MixinWithdrawResponse } from '../../../common/interfaces/transaction.interfaces';
import { WithdrawCommand } from './model/mixin-withdrawal.model';
import { MixinWithdrawalRepository } from './mixin-withdrawal.repository';
import { MixinWithdrawalStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class MixinWithdrawalService {
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly repository: MixinWithdrawalRepository,
  ) {}

  @Transactional()
  async withdraw(command: WithdrawCommand) {
    const withdrawal = await this.repository.save({
      ...command,
      amount: Number(command.amount),
      status: MixinWithdrawalStatus.SIGNED,
    });

    const withdrawalResult = await this.mixinGateway.handleWithdrawal(command);

    await this.updateWithdrawalTransactionHash(
      withdrawal.id,
      withdrawalResult.transaction_hash,
    );

    return {
      transactionHash: withdrawalResult.transaction_hash,
      snapshotId: withdrawalResult.snapshot_id,
    } as MixinWithdrawResponse;
  }

  async getSignedWithdrawals() {
    return await this.repository.findWithdrawalsByStatus(
      MixinWithdrawalStatus.SIGNED,
    );
  }

  async updateWithdrawalStatus(
    withdrawalId: number,
    status: MixinWithdrawalStatus,
  ) {
    await this.repository.updateStatusById(withdrawalId, status);
  }

  async updateWithdrawalTransactionHash(withdrawalId: number, txHash: string) {
    await this.repository.updateTransactionHashById(withdrawalId, txHash);
  }
}
