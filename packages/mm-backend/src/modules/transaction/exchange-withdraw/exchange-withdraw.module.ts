import { Module } from '@nestjs/common';
import { ExchangeWithdrawService } from './exchange-withdraw.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionProfile } from '../transaction.mapper';

@Module({
  imports: [HttpModule],
  providers: [
    ExchangeWithdrawService,
    TransactionProfile,
    ConfigService
  ],
  exports: [ExchangeWithdrawService]
})
export class ExchangeWithdrawModule {}
