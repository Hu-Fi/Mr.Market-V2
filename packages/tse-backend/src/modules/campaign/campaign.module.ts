import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { SchedulerUtil } from '../../common/utils/scheduler.utils';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    IntegrationsModule,
    ExchangeRegistryModule,
  ],
  providers: [CampaignService, SchedulerUtil],
})
export class CampaignModule {}
