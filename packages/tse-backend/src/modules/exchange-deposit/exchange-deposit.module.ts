import { Module } from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { ExchangeDepositController } from './exchange-deposit.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ExchangeDepositProfile } from './exchange-deposit.mapper';

@Module({
  imports: [IntegrationsModule],
  providers: [ExchangeDepositService, ExchangeDepositProfile],
  controllers: [ExchangeDepositController],
})
export class ExchangeDepositModule {}
