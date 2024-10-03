import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { ConfigService } from '@nestjs/config';
import { DbHealthService } from './db.health.service';
import { TseHealthService } from './tse.health.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [IntegrationsModule, HttpModule],
  providers: [ConfigService, HealthService, DbHealthService, TseHealthService],
  controllers: [HealthController],
})
export class HealthModule {}
