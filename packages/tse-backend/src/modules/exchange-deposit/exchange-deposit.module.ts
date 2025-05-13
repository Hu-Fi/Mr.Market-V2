import { Module } from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { ExchangeDepositController } from './exchange-deposit.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ExchangeDepositProfile } from './exchange-deposit.mapper';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeDeposit } from '../../common/entities/exchange-deposit.entity';
import { ExchangeDepositRepository } from './exchange-deposit.repository';

@Module({
  imports: [
    IntegrationsModule,
    ExchangeRegistryModule,
    TypeOrmModule.forFeature([ExchangeDeposit]),
  ],
  providers: [
    ExchangeDepositService,
    ExchangeDepositRepository,
    ExchangeDepositProfile
  ],
  controllers: [ExchangeDepositController],
  exports: [ExchangeDepositService],
})
export class ExchangeDepositModule {}
