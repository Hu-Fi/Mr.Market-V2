import { Module } from '@nestjs/common';
import { ExchangeRegistryService } from './exchange-registry.service';
import { ConfigService } from '@nestjs/config';
import { IntegrationsModule } from '../../integrations/integrations.module';

@Module({
  imports: [IntegrationsModule],
  providers: [ExchangeRegistryService, ConfigService],
  exports: [ExchangeRegistryService],
})
export class ExchangeRegistryModule {}
