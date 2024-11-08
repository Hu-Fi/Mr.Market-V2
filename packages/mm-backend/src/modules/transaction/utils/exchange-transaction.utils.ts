import { Injectable, Logger } from '@nestjs/common';
import { UserBalanceService } from '../../user-balance/user-balance.service';
import { ExchangeDepositService } from '../exchange-deposit/exchange-deposit.service';
import { ExchangeWithdrawalService } from '../exchange-withdraw/exchange-withdrawal.service';
import {
  ExchangeDepositStatus,
  ExchangeWithdrawalStatus,
} from '../../../common/enums/transaction.enum';
import { TransactionBalance } from '../../../common/interfaces/transaction.interfaces';
import { UserBalance } from '../../../common/entities/user-balance.entity';

@Injectable()
export class ExchangeTransactionUtils {
  private logger = new Logger(ExchangeTransactionUtils.name);

  constructor(
    private readonly depositService: ExchangeDepositService,
    private readonly withdrawService: ExchangeWithdrawalService,
    private readonly userBalanceService: UserBalanceService,
  ) {}

  async getDeposits(exchangeName: string, symbol: string) {
    return await this.depositService.getDeposits(exchangeName, symbol);
  }

  async getPendingDeposits() {
    return await this.depositService.getPendingDeposits();
  }

  async updateDepositStatus(depositId: number, status: ExchangeDepositStatus) {
    return await this.depositService.updateDepositStatus(depositId, status);
  }

  async updateDepositTransactionHash(depositId: number, txHash: string) {
    return await this.depositService.updateDepositTransactionHash(
      depositId,
      txHash,
    );
  }

  async updateUserBalance(
    transactionBalance: TransactionBalance,
  ): Promise<UserBalance> {
    return await this.userBalanceService.updateUserBalance(transactionBalance);
  }

  async getPendingWithdrawals() {
    return await this.withdrawService.getPendingWithdrawals();
  }

  async getWithdrawal(exchangeName: string, transactionHash: string) {
    return await this.withdrawService.getWithdrawal(
      exchangeName,
      transactionHash,
    );
  }

  async updateWithdrawalStatus(id: number, status: ExchangeWithdrawalStatus) {
    return await this.withdrawService.updateWithdrawalStatus(id, status);
  }
}
