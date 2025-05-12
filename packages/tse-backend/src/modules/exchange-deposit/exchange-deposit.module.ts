import { Module } from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { ExchangeDepositController } from './exchange-deposit.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ExchangeDepositProfile } from './exchange-deposit.mapper';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeDeposit } from '../../common/entities/exchange-deposit.entity';

@Module({
  imports: [
    IntegrationsModule,
    ExchangeRegistryModule,
    TypeOrmModule.forFeature([ExchangeDeposit]),
  ],
  providers: [ExchangeDepositService, ExchangeDepositProfile],
  controllers: [ExchangeDepositController],
})
export class ExchangeDepositModule {}
