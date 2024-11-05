import { Module } from '@nestjs/common';
import { CcxtGateway } from './ccxt.gateway';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [CcxtGateway, ConfigService],
  exports: [CcxtGateway],
})
export class IntegrationsModule {}
