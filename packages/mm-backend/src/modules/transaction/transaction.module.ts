import { Module } from '@nestjs/common';
import { DepositService } from './mixin-deposit/deposit.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositRepository } from './mixin-deposit/deposit.repository';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { TransactionProfile } from './transaction.mapper';
import { UserBalanceModule } from '../user-balance/user-balance.module';
import { Deposit } from '../../common/entities/deposit.entity';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { WithdrawService } from './mixin-withdraw/withdraw.service';
import { WithdrawRepository } from './mixin-withdraw/withdraw.repository';
import { Withdraw } from '../../common/entities/withdraw.entity';
import { TransactionService } from './transaction.service';
import { UserBalanceService } from '../user-balance/user-balance.service';
import { ExchangeDepositModule } from './exchange-deposit/exchange-deposit.module';
import { ExchangeWithdrawModule } from './exchange-withdraw/exchange-withdraw.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit, Withdraw]),
    IntegrationsModule,
    UserBalanceModule,
    ExchangeDepositModule,
    ExchangeWithdrawModule,
  ],
  providers: [
    DepositService,
    DepositRepository,
    WithdrawService,
    WithdrawRepository,
    TransactionService,
    TransactionProfile,
    SchedulerUtil,
    UserBalanceService,
  ],
  controllers: [TransactionController],
  exports: [DepositService, DepositRepository],
})
export class TransactionModule {}
