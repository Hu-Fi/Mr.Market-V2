import { Injectable } from '@nestjs/common';
import { UserBalanceRepository } from './user-balance.repository';
import { UserBalance } from '../../common/entities/user-balance.entity';
import { TransactionBalance } from '../../common/interfaces/transaction.interfaces';

@Injectable()
export class UserBalanceService {
  constructor(
    private readonly userBalanceRepository: UserBalanceRepository,
  ) {
  }
  async findOrCreateUserBalance(
    userId: string,
    exchange: string,
    currency: string,
  ): Promise<UserBalance> {
    let userBalance = await this.userBalanceRepository.findByUserIdExchangeCurrency(
      userId,
      exchange,
      currency,
    );

    if (!userBalance) {
      userBalance = new UserBalance();
      userBalance.userId = userId;
      userBalance.exchange = exchange;
      userBalance.currency = currency;
      userBalance.balance = 0;

      await this.userBalanceRepository.saveUserBalance(userBalance);
    }

    return userBalance;
  }

  async updateUserBalance(transactionBalance: TransactionBalance): Promise<UserBalance> {
    const { userId, exchange, currency, amount } = transactionBalance;
    const userBalance = await this.findOrCreateUserBalance(
      userId,
      exchange,
      currency,
    );

    if (userBalance.balance + amount < 0) {
      throw new Error('Insufficient balance');
    }

    userBalance.balance += amount;

    return await this.userBalanceRepository.saveUserBalance(userBalance);
  }
}
