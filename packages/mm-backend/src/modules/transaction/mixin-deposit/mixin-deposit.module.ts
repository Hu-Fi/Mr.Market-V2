import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionProfile } from '../transaction.mapper';
import { MixinDepositRepository } from '../mixin-deposit/mixin-deposit.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MixinDeposit } from '../../../common/entities/mixin-deposit.entity';
import { MixinDepositService } from './mixin-deposit.service';
import { MixinGateway } from '../../../integrations/mixin.gateway';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([MixinDeposit])],
  providers: [
    MixinDepositService,
    MixinDepositRepository,
    TransactionProfile,
    ConfigService,
    MixinGateway,
  ],
  exports: [MixinDepositService],
})
export class MixinDepositModule {}
