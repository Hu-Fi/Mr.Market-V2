import { Module } from '@nestjs/common';
import { ExchangeWithdrawService } from './exchange-withdraw.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionProfile } from '../transaction.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdraw } from '../../../common/entities/withdraw.entity';
import { WithdrawRepository } from '../mixin-withdraw/withdraw.repository';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Withdraw])],
  providers: [
    ExchangeWithdrawService,
    TransactionProfile,
    ConfigService,
    WithdrawRepository,
  ],
  exports: [ExchangeWithdrawService],
})
export class ExchangeWithdrawModule {}
