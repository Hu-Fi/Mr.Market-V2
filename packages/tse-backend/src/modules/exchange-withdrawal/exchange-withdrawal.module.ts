import { Module } from '@nestjs/common';
import { ExchangeWithdrawalService } from './exchange-withdrawal.service';
import { ExchangeWithdrawalController } from './exchange-withdrawal.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ExchangeWithdrawalProfile } from './exchange-withdrawal.mapper';

@Module({
  imports: [IntegrationsModule],
  providers: [ExchangeWithdrawalService, ExchangeWithdrawalProfile],
  controllers: [ExchangeWithdrawalController],
})
export class ExchangeWithdrawalModule {}
