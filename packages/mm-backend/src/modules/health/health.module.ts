import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ConfigService } from '@nestjs/config';
import { DbHealthService } from './db.health.service';

@Module({
  imports: [IntegrationsModule],
  providers: [
    ConfigService,
    HealthService,
    DbHealthService,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
