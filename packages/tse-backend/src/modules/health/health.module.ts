import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ConfigService } from '@nestjs/config';
import { ExchangesHealthService } from './exchanges.health.service';
import { DbHealthService } from './db.health.service';

@Module({
  imports: [IntegrationsModule],
  providers: [
    ConfigService,
    HealthService,
    ExchangesHealthService,
    DbHealthService,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
