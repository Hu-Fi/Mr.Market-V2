import { Injectable, Logger } from '@nestjs/common';
import { MixinIntegrationService } from '../../integrations/mixin.integration.service';
import { MixinWithdrawalStatus } from '../../common/enums/transaction.enum';
import { TransactionUtils } from './transaction.utils';

@Injectable()
export class TransactionService {
  private logger = new Logger(TransactionService.name);

  constructor(
    private readonly mixinGateway: MixinIntegrationService,
    private readonly mixinTransactionUtils: TransactionUtils,
  ) {}

  async processData() {
    try {
      this.logger.log(`Starting processData execution.`);
      await this.processMixinDeposits();
      await this.processMixinWithdrawals();
      this.logger.log(`processData execution completed.`);
    } catch (e) {
      this.logger.error(`processData execution failed.`);
      throw e;
    }
  }

  async processMixinDeposits() {
    const outputs = await this.mixinGateway.getUnspentTransactionOutputs();
    const pendingDeposits =
      await this.mixinTransactionUtils.getPendingDeposits();
    if (
      outputs &&
      outputs.length > 0 &&
      pendingDeposits &&
      pendingDeposits.length > 0
    ) {
      await this.mixinTransactionUtils.findAndProcessMatchingDeposits(
        outputs,
        pendingDeposits,
      );
    }
  }

  async processMixinWithdrawals() {
    const signedWithdrawals =
      await this.mixinTransactionUtils.getSignedWithdrawals();
    for (const withdrawal of signedWithdrawals) {
      const { transactionHash, id } = withdrawal;
      const transactionDetails =
        await this.mixinGateway.fetchTransactionDetails(transactionHash);
      if (transactionDetails.state === MixinWithdrawalStatus.SPENT) {
        await this.mixinTransactionUtils.updateWithdrawalStatus(
          id,
          MixinWithdrawalStatus.SPENT,
        );
        this.logger.debug(
          `Withdrawal ${withdrawal.id} confirmed and updated to spent`,
        );
      }
    }
  }
}
