import { Module } from '@nestjs/common';
import { ExchangeDataService } from './exchange-data.service';
import { ExchangeDataController } from './exchange-data.controller';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { ExchangeDataProfile } from './exchange-data.mapper';

@Module({
  imports: [ExchangeRegistryModule],
  providers: [ExchangeDataService, ExchangeDataProfile],
  controllers: [ExchangeDataController],
})
export class ExchangeDataModule {}
