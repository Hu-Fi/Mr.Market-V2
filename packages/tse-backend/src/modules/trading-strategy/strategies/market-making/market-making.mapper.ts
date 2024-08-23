import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyActionDto,
  MarketMakingStrategyCommand,
  MarketMakingStrategyDto,
} from './model/market-making.dto';

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
          (destination) => destination.pair,
          mapFrom((source) => source.pair.toUpperCase()),
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
