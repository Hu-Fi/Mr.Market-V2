import { Module } from '@nestjs/common';
import { ExchangeDataService } from './exchange-data.service';
import { ExchangeDataController } from './exchange-data.controller';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { ExchangeDataProfile } from './exchange-data.mapper';
import { ExchangeDataWsGateway } from './exchange-data.ws.gateway';
import { ExchangeDataSubscriptionManager } from './subscription-manager.ws.service';

@Module({
  imports: [ExchangeRegistryModule],
  providers: [
    ExchangeDataService,
    ExchangeDataProfile,
    ExchangeDataWsGateway,
    ExchangeDataSubscriptionManager,
  ],
  controllers: [ExchangeDataController],
})
export class ExchangeDataModule {}
