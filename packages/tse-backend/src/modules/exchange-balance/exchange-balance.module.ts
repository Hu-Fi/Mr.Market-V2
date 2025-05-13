import { Module } from '@nestjs/common';
import { ExchangeBalanceService } from './exchange-balance.service';
import { ExchangeBalanceController } from './exchange-balance.controller';
import { ExchangeBalanceProfile } from './exchange-balance.mapper';
import { ExchangeDepositModule } from '../exchange-deposit/exchange-deposit.module';

@Module({
  imports: [ExchangeDepositModule],
  controllers: [ExchangeBalanceController],
  providers: [
    ExchangeBalanceService,
    ExchangeBalanceProfile,
  ],
  exports: [ExchangeBalanceService],
})
export class ExchangeBalanceModule {}
