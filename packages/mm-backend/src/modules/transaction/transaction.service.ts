import { Injectable, Logger } from '@nestjs/common';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { DepositService } from './mixin-deposit/deposit.service';
import { MixinGateway } from '../../integrations/mixin.gateway';
import { Deposit } from '../../common/entities/deposit.entity';
import {
  DepositStatus,
  WithdrawalStatus,
} from '../../common/enums/transaction.enum';
import { UserBalanceService } from '../user-balance/user-balance.service';
import { WithdrawService } from './mixin-withdraw/withdraw.service';

@Injectable()
export class TransactionService {
  private logger = new Logger(TransactionService.name);
  private isJobRunning: boolean = false;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly schedulerUtils: SchedulerUtil,
    private readonly depositService: DepositService,
    private readonly withdrawService: WithdrawService,
    private readonly mixinGateway: MixinGateway,
    private readonly userBalanceService: UserBalanceService,
  ) {}

  onModuleInit() {
    this.schedulerUtils.addCronJob(
      TransactionService.name,
      CronExpression.EVERY_5_MINUTES,
      this.handleCron.bind(this),
      this.schedulerRegistry,
    );
  }

  private async processData() {
    this.logger.debug('Worker checking transactions in progress started');
    await this.processDeposits();
    await this.processWithdrawals();
  }

  async processDeposits() {
    const outputs = await this.mixinGateway.getUnspentTransactionOutputs();
    const pendingDeposits = await this.getPendingDeposits();
    if (
      outputs &&
      outputs.length > 0 &&
      pendingDeposits &&
      pendingDeposits.length > 0
    ) {
      await this.findMatchingDeposit(outputs, pendingDeposits);
    }
  }

  async processWithdrawals() {
    const signedWithdrawals = await this.withdrawService.getSignedWithdrawals();
    for (const withdrawal of signedWithdrawals) {
      const { transactionHash, id } = withdrawal;
      const transactionDetails =
        await this.mixinGateway.fetchTransactionDetails(transactionHash);
      if (transactionDetails.state === WithdrawalStatus.SPENT) {
        await this.withdrawService.updateWithdrawalStatus(
          id,
          WithdrawalStatus.SPENT,
        );
        await this.userBalanceService.updateUserBalance({
          userId: withdrawal.userId,
          assetId: withdrawal.assetId,
          amount: -withdrawal.amount,
        });
        this.logger.debug(
          `Withdrawal ${withdrawal.id} confirmed and updated to spent`,
        );
      }
    }
  }

  private async getPendingDeposits(): Promise<Deposit[]> {
    const pendingDeposits = await this.depositService.getPendingDeposits();
    return pendingDeposits && pendingDeposits.length > 0
      ? pendingDeposits
      : null;
  }

  private async findMatchingDeposit(
    outputs: any[],
    pendingDeposits: Deposit[],
  ) {
    for (const deposit of pendingDeposits) {
      const matchingOutput = outputs.find(
        (output) =>
          output.asset_id === deposit.assetId &&
          parseFloat(output.amount) === parseFloat(String(deposit.amount)) &&
          new Date(output.created_at) > new Date(deposit.createdAt),
      );

      if (matchingOutput) {
        await this.userBalanceService.updateUserBalance({
          userId: deposit.userId,
          assetId: deposit.assetId,
          amount: deposit.amount,
        });
        await this.depositService.updateDepositStatus(
          deposit.id,
          DepositStatus.CONFIRMED,
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

  async handleCron() {
    if (this.isJobRunning) {
      this.logger.warn('Job still running, skipping');
      return;
    }
    this.isJobRunning = true;
    try {
      await this.processData();
    } catch (error) {
      this.logger.error('Error processing data', error.stack);
    } finally {
      this.isJobRunning = false;
    }
  }
}
