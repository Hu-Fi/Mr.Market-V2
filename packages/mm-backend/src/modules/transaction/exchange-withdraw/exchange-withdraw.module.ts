import { Module } from '@nestjs/common';
import { ExchangeWithdrawService } from './exchange-withdraw.service';
import { ExchangeWithdrawalProfile } from './exchange-withdraw.mapper';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [
    ExchangeWithdrawService,
    ExchangeWithdrawalProfile,
    ConfigService
  ],
  exports: [ExchangeWithdrawService]
})
export class ExchangeWithdrawModule {}
