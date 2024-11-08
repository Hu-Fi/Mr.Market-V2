import { Injectable, Logger } from '@nestjs/common';
import { MixinDeposit } from '../../../common/entities/mixin-deposit.entity';
import {
  MixinDepositStatus,
  MixinWithdrawalStatus,
} from '../../../common/enums/transaction.enum';
import { UserBalanceService } from '../../user-balance/user-balance.service';
import { MixinDepositService } from '../mixin-deposit/mixin-deposit.service';
import { MixinWithdrawalService } from '../mixin-withdraw/mixin-withdrawal.service';
import { TransactionBalance } from '../../../common/interfaces/transaction.interfaces';
import { UserBalance } from '../../../common/entities/user-balance.entity';

@Injectable()
export class MixinTransactionUtils {
  private logger = new Logger(MixinTransactionUtils.name);

  constructor(
    private readonly depositService: MixinDepositService,
    private readonly withdrawService: MixinWithdrawalService,
    private readonly userBalanceService: UserBalanceService,
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
        await this.updateUserBalance({
          userId: deposit.userId,
          assetId: deposit.assetId,
          amount: deposit.amount,
        });
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

  async updateUserBalance(
    transactionBalance: TransactionBalance,
  ): Promise<UserBalance> {
    return await this.userBalanceService.updateUserBalance(transactionBalance);
  }
}
