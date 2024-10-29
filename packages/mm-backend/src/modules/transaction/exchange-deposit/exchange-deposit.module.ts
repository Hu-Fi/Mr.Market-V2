import { Module } from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionProfile } from '../transaction.mapper';

@Module({
  imports: [HttpModule],
  providers: [
    ExchangeDepositService,
    TransactionProfile,
    ConfigService
  ],
  exports: [ExchangeDepositService]
})
export class ExchangeDepositModule {}
