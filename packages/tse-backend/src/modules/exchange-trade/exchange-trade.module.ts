import { Module } from '@nestjs/common';
import { ExchangeTradeService } from './exchange-trade.service';
import { ExchangeTradeController } from './exchange-trade.controller';
import { ExchangeOperationModule } from '../exchange-operation/exchange-operation.module';
import { ExchangeRegistryModule } from '../exchange-registry/exchange-registry.module';
import { MarketTradeProfile } from './exchange-trade.mapper';

@Module({
  imports: [ExchangeRegistryModule, ExchangeOperationModule],
  providers: [ExchangeTradeService, MarketTradeProfile],
  controllers: [ExchangeTradeController],
})
export class ExchangeTradeModule {}
