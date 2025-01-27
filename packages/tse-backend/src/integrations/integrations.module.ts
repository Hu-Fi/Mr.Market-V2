import { Module } from '@nestjs/common';
import { CcxtIntegrationService } from './ccxt.integration.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [ConfigService, CcxtIntegrationService],
  exports: [CcxtIntegrationService],
})
export class IntegrationsModule {}
