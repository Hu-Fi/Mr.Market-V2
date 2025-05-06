import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  CancelOrderCommand,
  CancelOrderDto,
  MarketLimitCommand,
  MarketLimitDto,
  MarketTradeCommand,
  MarketTradeDto,
} from './model/exchange-trade.model';
import { Decimal } from 'decimal.js';

@Injectable()
export class MarketTradeProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        MarketTradeDto,
        MarketTradeCommand,
        forMember(
          (destination) => destination.amount,
          mapFrom((source) => new Decimal(source.amount)),
        ),
      );
      createMap(
        mapper,
        MarketLimitDto,
        MarketLimitCommand,
        forMember(
          (destination) => destination.amount,
          mapFrom((source) => new Decimal(source.amount)),
        ),
      );
      createMap(mapper, CancelOrderDto, CancelOrderCommand);
    };
  }
}
