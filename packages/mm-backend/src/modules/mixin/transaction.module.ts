import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { TransactionProfile } from './transaction.mapper';
import { UserBalanceModule } from './balance/user-balance.module';
import { TransactionService } from './transaction.service';
import { TransactionUtils } from './transaction.utils';
import { MixinWithdrawalModule } from './withdrawal/mixin-withdrawal.module';
import { MixinDepositModule } from './deposit/mixin-deposit.module';
import { MixinAuthModule } from './auth/auth.module';

@Module({
  imports: [
    IntegrationsModule,
    MixinAuthModule,
    UserBalanceModule,
    MixinDepositModule,
    MixinWithdrawalModule,
  ],
  providers: [TransactionService, TransactionProfile, TransactionUtils],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
