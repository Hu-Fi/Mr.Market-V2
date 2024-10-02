import { Module } from '@nestjs/common';
import { MixinGateway } from './mixin.gateway';

@Module({
  providers: [MixinGateway],
  exports: [MixinGateway],
})
export class IntegrationsModule {}
