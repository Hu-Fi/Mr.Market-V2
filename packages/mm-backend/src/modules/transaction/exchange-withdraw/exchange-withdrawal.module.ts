import { Module } from '@nestjs/common';
import { ExchangeWithdrawalService } from './exchange-withdrawal.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionProfile } from '../transaction.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeWithdrawal } from '../../../common/entities/exchange-withdrawal.entity';
import { ExchangeWithdrawalRepository } from './exchange-withdrawal.repository';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([ExchangeWithdrawal])],
  providers: [
    ExchangeWithdrawalService,
    ExchangeWithdrawalRepository,
    TransactionProfile,
    ConfigService,
  ],
  exports: [ExchangeWithdrawalService],
})
export class ExchangeWithdrawalModule {}
