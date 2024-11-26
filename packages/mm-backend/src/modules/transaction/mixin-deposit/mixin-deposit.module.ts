import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionProfile } from '../transaction.mapper';
import { MixinDepositRepository } from '../mixin-deposit/mixin-deposit.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MixinDeposit } from '../../../common/entities/mixin-deposit.entity';
import { MixinDepositService } from './mixin-deposit.service';
import { MixinIntegrationService } from '../../../integrations/mixin.integration.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([MixinDeposit])],
  providers: [
    MixinDepositService,
    MixinDepositRepository,
    TransactionProfile,
    ConfigService,
    MixinIntegrationService,
  ],
  exports: [MixinDepositService],
})
export class MixinDepositModule {}
