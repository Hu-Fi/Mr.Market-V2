import { Module } from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { ExchangeDepositProfile } from './exchange-deposit.mapper';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [
    ExchangeDepositService,
    ExchangeDepositProfile,
    ConfigService
  ],
  exports: [ExchangeDepositService]
})
export class ExchangeDepositModule {}
