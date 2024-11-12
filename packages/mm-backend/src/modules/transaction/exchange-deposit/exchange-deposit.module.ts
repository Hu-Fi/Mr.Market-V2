import { Module } from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionProfile } from '../transaction.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeDepositRepository } from './exchange-deposit.repository';
import { ExchangeDeposit } from '../../../common/entities/exchange-deposit.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([ExchangeDeposit])],
  providers: [
    ExchangeDepositService,
    ExchangeDepositRepository,
    TransactionProfile,
    ConfigService,
  ],
  exports: [ExchangeDepositService],
})
export class ExchangeDepositModule {}
