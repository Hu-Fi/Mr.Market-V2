import { Module } from '@nestjs/common';
import { ExchangeWithdrawalService } from './exchange-withdrawal.service';
import { ExchangeWithdrawalController } from './exchange-withdrawal.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ExchangeWithdrawalProfile } from './exchange-withdrawal.mapper';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeWithdrawal } from '../../common/entities/exchange-withdrawal.entity';

@Module({
  imports: [
    IntegrationsModule,
    ExchangeRegistryModule,
    TypeOrmModule.forFeature([ExchangeWithdrawal]),
  ],
  providers: [ExchangeWithdrawalService, ExchangeWithdrawalProfile],
  controllers: [ExchangeWithdrawalController],
})
export class ExchangeWithdrawalModule {}
