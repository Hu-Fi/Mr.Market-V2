import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyActionDto,
  MarketMakingStrategyCommand,
  MarketMakingStrategyDto,
} from './model/market-making.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class MarketMakingStrategyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        MarketMakingStrategyDto,
        MarketMakingStrategyCommand,
        forMember(
          (destination) => destination.exchangeName,
          mapFrom((source) => source.exchangeName.toLowerCase()),
        ),
        forMember(
          (destination) => destination.sideA,
          mapFrom((source) => source.pair.split('/')[0].toUpperCase()),
        ),
        forMember(
          (destination) => destination.sideB,
          mapFrom((source) => source.pair.split('/')[1].toUpperCase()),
        ),
        forMember(
          (destination) => destination.orderAmount,
          mapFrom((source) => new Decimal(source.orderAmount)),
        ),
      );
      createMap(
        mapper,
        MarketMakingStrategyActionDto,
        MarketMakingStrategyActionCommand,
      );
    };
  }
}
