import { Module } from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionProfile } from '../transaction.mapper';
import { DepositRepository } from '../mixin-deposit/deposit.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from '../../../common/entities/deposit.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Deposit]),],
  providers: [
    ExchangeDepositService,
    TransactionProfile,
    ConfigService,
    DepositRepository
  ],
  exports: [ExchangeDepositService]
})
export class ExchangeDepositModule {}
