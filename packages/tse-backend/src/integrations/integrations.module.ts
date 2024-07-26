import { Module } from '@nestjs/common';
import { CcxtGateway } from './ccxt.gateway';

@Module({
  providers: [CcxtGateway],
  exports: [CcxtGateway],
})
export class IntegrationsModule {}
