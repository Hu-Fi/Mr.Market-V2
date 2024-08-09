import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from '@automapper/core';
import {
  CancelOrderCommand,
  CancelOrderDto,
  MarketLimitCommand,
  MarketLimitDto,
  MarketTradeCommand,
  MarketTradeDto,
} from './model/exchange-trade.model';

@Injectable()
export class MarketTradeProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, MarketTradeDto, MarketTradeCommand);
      createMap(mapper, MarketLimitDto, MarketLimitCommand);
      createMap(mapper, CancelOrderDto, CancelOrderCommand);
    };
  }
}
