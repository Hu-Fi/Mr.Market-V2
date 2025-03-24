import { Injectable } from '@nestjs/common';
import { UserBalanceRepository } from './user-balance.repository';
import { UserBalance } from '../../common/entities/user-balance.entity';
import Decimal from 'decimal.js';
import { TransactionBalance } from '../../common/interfaces/transaction.interfaces';
import { MixinIntegrationService } from '../../integrations/mixin.integration.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserBalanceService {
  constructor(
    private readonly userBalanceRepository: UserBalanceRepository,
    private readonly mixinGateway: MixinIntegrationService,
    private readonly authService: AuthService,
  ) {}
  async findOrCreateUserBalance(
    userId: string,
    assetId: string,
  ): Promise<UserBalance> {
    let userBalance = await this.userBalanceRepository.findByUserIdAssetId(
      userId,
      assetId,
    );

    if (!userBalance) {
      userBalance = new UserBalance();
      userBalance.userId = userId;
      userBalance.assetId = assetId;
      userBalance.balance = 0;

      await this.userBalanceRepository.saveUserBalance(userBalance);
    }

    return userBalance;
  }

  async updateUserBalance(
    transactionBalance: TransactionBalance,
  ): Promise<UserBalance> {
    const { userId, assetId, amount } = transactionBalance;
    const userBalance = await this.findOrCreateUserBalance(userId, assetId);

    const currentBalance = new Decimal(userBalance.balance);
    const transactionAmount = new Decimal(amount);

    if (currentBalance.plus(transactionAmount).isNegative()) {
      throw new Error('Insufficient balance');
    }

    userBalance.balance = currentBalance.plus(transactionAmount).toNumber();

    return this.userBalanceRepository.saveUserBalance(userBalance);
  }

  async getMixinUserBalance(userId: string) {
    const clientSession =
      await this.authService.getMixinUserAuthSession(userId);
    return await this.mixinGateway.fetchUserBalanceDetails(clientSession);
  }
}
