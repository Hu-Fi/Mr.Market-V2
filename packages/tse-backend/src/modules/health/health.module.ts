import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [IntegrationsModule],
  providers: [HealthService, ConfigService],
  controllers: [HealthController],
})
export class HealthModule {}
