import { Module } from '@nestjs/common';
import { DepositService } from './deposit/deposit.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositRepository } from './deposit/deposit.repository';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { TransactionProfile } from './transaction.mapper';
import { UserBalanceModule } from '../user-balance/user-balance.module';
import { Deposit } from '../../common/entities/deposit.entity';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { WithdrawService } from './withdraw/withdraw.service';
import { WithdrawRepository } from './withdraw/withdraw.repository';
import { Withdraw } from '../../common/entities/withdraw.entity';
import { TransactionService } from './transaction.service';
import { UserBalanceService } from '../user-balance/user-balance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit, Withdraw]),
    IntegrationsModule,
    UserBalanceModule,
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
