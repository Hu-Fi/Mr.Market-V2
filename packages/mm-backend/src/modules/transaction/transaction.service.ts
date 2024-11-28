import { Injectable, Logger } from '@nestjs/common';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { MixinGateway } from '../../integrations/mixin.gateway';
import {
  ExchangeDepositStatus,
  ExchangeWithdrawalStatus,
  MixinWithdrawalStatus,
} from '../../common/enums/transaction.enum';
import { MixinTransactionUtils } from './utils/mixin-transaction.utils';
import { ExchangeTransactionUtils } from './utils/exchange-transaction.utils';

@Injectable()
export class TransactionService {
  private logger = new Logger(TransactionService.name);
  private isJobRunning: boolean = false;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly schedulerUtils: SchedulerUtil,
    private readonly mixinGateway: MixinGateway,
    private readonly mixinTransactionUtils: MixinTransactionUtils,
    private readonly exchangeTransactionUtils: ExchangeTransactionUtils,
  ) {}

  onModuleInit() {
    this.schedulerUtils.addCronJob(
      TransactionService.name,
      CronExpression.EVERY_5_MINUTES,
      this.handleCron.bind(this),
      this.schedulerRegistry,
    );
  }

  async processData() {
    this.logger.debug('Worker checking transactions in progress started');
    await this.processMixinDeposits();
    await this.processMixinWithdrawals();

    await this.processExchangeDeposits();
    await this.processExchangeWithdrawals();
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
        await this.mixinTransactionUtils.updateUserBalance({
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

  private async processExchangeDeposits() {
    const pendingDeposits =
      await this.exchangeTransactionUtils.getPendingDeposits();
    for (const pendingDeposit of pendingDeposits) {
      const { id, userId, exchangeName, assetId, amount, destination } =
        pendingDeposit;
      const exchangeDeposits = await this.exchangeTransactionUtils.getDeposits(
        exchangeName,
        assetId,
      );
      for (const exchangeDeposit of exchangeDeposits) {
        if (
          exchangeDeposit.amount == amount &&
          exchangeDeposit.addressTo == destination
        ) {
          await this.exchangeTransactionUtils.updateDepositStatus(
            id,
            ExchangeDepositStatus.OK,
          );
          await this.exchangeTransactionUtils.updateDepositTransactionHash(
            id,
            exchangeDeposit.txid,
          );
          await this.exchangeTransactionUtils.updateUserBalance({
            userId,
            assetId,
            amount,
          });
          break;
        }
      }
    }
  }

  private async processExchangeWithdrawals() {
    const pendingWithdrawals =
      await this.exchangeTransactionUtils.getPendingWithdrawals();
    for (const pendingWithdrawal of pendingWithdrawals) {
      const { transactionHash, exchangeName, userId, assetId, amount } =
        pendingWithdrawal;
      const txDetails = await this.exchangeTransactionUtils.getWithdrawal(
        exchangeName,
        transactionHash,
      );
      if (txDetails.status == ExchangeWithdrawalStatus.OK) {
        await this.exchangeTransactionUtils.updateWithdrawalStatus(
          pendingWithdrawal.id,
          ExchangeWithdrawalStatus.OK,
        );
        await this.mixinTransactionUtils.updateUserBalance({
          userId,
          assetId,
          amount: -amount,
        });
        break;
      }
    }
  }
}
