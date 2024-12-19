import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { TransactionProfile } from './transaction.mapper';
import { UserBalanceModule } from '../user-balance/user-balance.module';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { TransactionService } from './transaction.service';
import { UserBalanceService } from '../user-balance/user-balance.service';
import { ExchangeDepositModule } from './exchange-deposit/exchange-deposit.module';
import { ExchangeWithdrawalModule } from './exchange-withdraw/exchange-withdrawal.module';
import { MixinTransactionUtils } from './utils/mixin-transaction.utils';
import { ExchangeTransactionUtils } from './utils/exchange-transaction.utils';
import { MixinWithdrawalModule } from './mixin-withdraw/mixin-withdrawal.module';
import { MixinDepositModule } from './mixin-deposit/mixin-deposit.module';

@Module({
  imports: [
    IntegrationsModule,
    UserBalanceModule,
    MixinDepositModule,
    MixinWithdrawalModule,
    ExchangeDepositModule,
    ExchangeWithdrawalModule,
  ],
  providers: [
    TransactionService,
    TransactionProfile,
    SchedulerUtil,
    UserBalanceService,
    MixinTransactionUtils,
    ExchangeTransactionUtils,
  ],
  controllers: [TransactionController],
  exports: [TransactionService]
})
export class TransactionModule {}
