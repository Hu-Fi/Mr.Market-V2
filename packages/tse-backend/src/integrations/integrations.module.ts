import { Module } from '@nestjs/common';
import { CcxtIntegrationService } from './ccxt.integration.service';
import { ConfigService } from '@nestjs/config';
import { Web3IntegrationService } from './web3.integration.service';

@Module({
  providers: [CcxtIntegrationService, ConfigService, Web3IntegrationService],
  exports: [CcxtIntegrationService, Web3IntegrationService],
})
export class IntegrationsModule {}
