import { Injectable } from '@nestjs/common';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { Transactional } from 'typeorm-transactional';
import { WithdrawResponse } from '../../../common/interfaces/transaction.interfaces';
import { WithdrawCommand } from './model/withdraw.model';
import { WithdrawRepository } from './withdraw.repository';
import { WithdrawalStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class WithdrawService {
  constructor(
    private readonly mixinGateway: MixinGateway,
    private readonly repository: WithdrawRepository,
  ) {}

  @Transactional()
  async withdraw(command: WithdrawCommand) {
    const withdrawal = await this.repository.save({
      ...command,
      amount: Number(command.amount),
      status: WithdrawalStatus.SIGNED,
    });

    const withdrawalResult = await this.mixinGateway.handleWithdrawal(command);

    await this.updateWithdrawalTransactionHash(withdrawal.id, withdrawalResult.transaction_hash);

    return {
      transactionHash: withdrawalResult.transaction_hash,
      snapshotId: withdrawalResult.snapshot_id,
    } as WithdrawResponse;
  }

  async getSignedWithdrawals() {
    return await this.repository.findWithdrawalsByStatus(WithdrawalStatus.SIGNED);
  }

  async updateWithdrawalStatus(withdrawalId: number, status: WithdrawalStatus) {
    await this.repository.updateStatusById(withdrawalId, status);
  }

  async updateWithdrawalTransactionHash(withdrawalId: number, txHash: string) {
    await this.repository.updateTransactionHashById(withdrawalId, txHash);
  }
}
