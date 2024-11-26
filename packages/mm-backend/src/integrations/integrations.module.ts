import { Module } from '@nestjs/common';
import { MixinIntegrationService } from './mixin.integration.service';

@Module({
  providers: [MixinIntegrationService],
  exports: [MixinIntegrationService],
})
export class IntegrationsModule {}
