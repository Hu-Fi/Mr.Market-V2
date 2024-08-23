import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  ArbitrageStrategyCommand,
  ArbitrageStrategyDto,
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyActionDto,
} from './strategies/arbitrage/model/arbitrage.dto';

@Injectable()
export class TradingStrategyProfile extends AutomapperProfile {
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
          (destination) => destination.pair,
          mapFrom((source) => source.pair.toUpperCase()),
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
