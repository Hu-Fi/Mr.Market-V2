import { Injectable } from '@nestjs/common';
import { UserBalanceRepository } from './user-balance.repository';
import { UserBalance } from '../../common/entities/user-balance.entity';

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

  async updateUserBalance(
    userId: string,
    exchange: string,
    currency: string,
    amount: number, // Positive for deposit, negative for withdrawal
  ): Promise<UserBalance> {
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
