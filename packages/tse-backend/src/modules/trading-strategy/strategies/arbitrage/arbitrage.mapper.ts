import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyActionDto,
  ArbitrageStrategyCommand,
  ArbitrageStrategyDto,
} from './model/arbitrage.dto';

@Injectable()
export class ArbitrageStrategyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        ArbitrageStrategyDto,
        ArbitrageStrategyCommand,
        forMember(
          (destination) => destination.exchangeAName,
          mapFrom((source) => source.exchangeAName.toLowerCase()),
        ),
        forMember(
          (destination) => destination.exchangeBName,
          mapFrom((source) => source.exchangeBName.toLowerCase()),
        ),
        forMember(
          (destination) => destination.sideA,
          mapFrom((source) => source.pair.split('/')[0].toUpperCase()),
        ),
        forMember(
          (destination) => destination.sideB,
          mapFrom((source) => source.pair.split('/')[1].toUpperCase()),
        ),
      );
      createMap(
        mapper,
        ArbitrageStrategyActionDto,
        ArbitrageStrategyActionCommand,
      );
    };
  }
}
