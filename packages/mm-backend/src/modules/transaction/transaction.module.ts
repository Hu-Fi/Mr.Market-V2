import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositRepository } from './deposit.repository';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { TransactionProfile } from './transaction.mapper';
import { UserBalanceModule } from '../user-balance/user-balance.module';
import { Deposit } from '../../common/entities/deposit.entity';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit]),
    IntegrationsModule,
    UserBalanceModule,
  ],
  providers: [
    DepositService,
    DepositRepository,
    TransactionProfile,
    TransactionService,
    SchedulerUtil,
  ],
  controllers: [TransactionController],
  exports: [DepositService, DepositRepository],
})
export class TransactionModule {}
