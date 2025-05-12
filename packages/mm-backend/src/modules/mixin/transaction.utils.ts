import { Injectable, Logger } from '@nestjs/common';
import { MixinDeposit } from '../../common/entities/mixin-deposit.entity';
import {
  MixinDepositStatus,
  MixinWithdrawalStatus,
} from '../../common/enums/transaction.enum';
import { MixinDepositService } from './deposit/mixin-deposit.service';
import { MixinWithdrawalService } from './withdrawal/mixin-withdrawal.service';

@Injectable()
export class TransactionUtils {
  private logger = new Logger(TransactionUtils.name);

  constructor(
    private readonly depositService: MixinDepositService,
    private readonly withdrawService: MixinWithdrawalService,
  ) {}

  async getPendingDeposits(): Promise<MixinDeposit[]> {
    const pendingDeposits = await this.depositService.getPendingDeposits();
    return pendingDeposits && pendingDeposits.length > 0
      ? pendingDeposits
      : null;
  }

  async findAndProcessMatchingDeposits(
    outputs: any[],
    pendingDeposits: MixinDeposit[],
  ) {
    for (const deposit of pendingDeposits) {
      const matchingOutput = outputs.find(
        (output) =>
          output.asset_id === deposit.assetId &&
          parseFloat(output.amount) === parseFloat(String(deposit.amount)) &&
          new Date(output.created_at) > new Date(deposit.createdAt),
      );

      if (matchingOutput) {
        await this.depositService.updateDepositStatus(
          deposit.id,
          MixinDepositStatus.CONFIRMED,
        );
        await this.depositService.updateDepositTransactionHash(
          deposit.id,
          matchingOutput.transaction_hash,
        );
        this.logger.debug(
          `Deposit ${deposit.id} confirmed with transaction hash ${matchingOutput.transaction_hash}`,
        );
      }
    }
  }

  async updateWithdrawalStatus(
    withdrawalId: number,
    status: MixinWithdrawalStatus,
  ) {
    await this.withdrawService.updateWithdrawalStatus(withdrawalId, status);
  }

  async getSignedWithdrawals() {
    return await this.withdrawService.getSignedWithdrawals();
  }
}
