import { Module } from '@nestjs/common';
import { ExchangeBalanceService } from './exchange-balance.service';
import { ExchangeBalanceController } from './exchange-balance.controller';
import { ExchangeBalanceProfile } from './exchange-balance.mapper';
import { ExchangeDepositModule } from '../exchange-deposit/exchange-deposit.module';
import { ExchangeWithdrawalModule } from '../exchange-withdrawal/exchange-withdrawal.module';
import { DepositBalanceStrategy } from './strategies/deposit-balance.strategy';
import { WithdrawalBalanceStrategy } from './strategies/withdarawal-balance.strategy';

@Module({
  imports: [ExchangeDepositModule, ExchangeWithdrawalModule],
  controllers: [ExchangeBalanceController],
  providers: [
    DepositBalanceStrategy,
    WithdrawalBalanceStrategy,
    {
      provide: 'BALANCE_STRATEGIES',
      useFactory: (
        deposit: DepositBalanceStrategy,
        withdrawal: WithdrawalBalanceStrategy,
      ) => [deposit, withdrawal],
      inject: [DepositBalanceStrategy, WithdrawalBalanceStrategy],
    },
    ExchangeBalanceService,
    ExchangeBalanceProfile,
  ],
  exports: [ExchangeBalanceService],
})
export class ExchangeBalanceModule {}
