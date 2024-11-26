import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TransactionProfile } from '../transaction.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MixinWithdrawal } from '../../../common/entities/mixin-withdrawal.entity';
import { MixinWithdrawalService } from './mixin-withdrawal.service';
import { MixinWithdrawalRepository } from './mixin-withdrawal.repository';
import { MixinIntegrationService } from '../../../integrations/mixin.integration.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([MixinWithdrawal])],
  providers: [
    MixinWithdrawalService,
    MixinWithdrawalRepository,
    TransactionProfile,
    ConfigService,
    MixinIntegrationService,
  ],
  exports: [MixinWithdrawalService],
})
export class MixinWithdrawalModule {}
