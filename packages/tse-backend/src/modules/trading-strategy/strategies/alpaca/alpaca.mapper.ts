import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  AlpacaStrategyActionCommand,
  AlpacaStrategyActionDto,
  AlpacaStrategyCommand,
  AlpacaStrategyDto,
} from './model/alpaca.model';

@Injectable()
export class AlpacaStrategyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        AlpacaStrategyDto,
        AlpacaStrategyCommand,
        forMember(
          (destination) => destination.sideA,
          mapFrom((source) => source.pair.split('/')[0].toUpperCase()),
        ),
        forMember(
          (destination) => destination.sideB,
          mapFrom((source) => source.pair.split('/')[1].toUpperCase()),
        ),
      );
      createMap(mapper, AlpacaStrategyActionDto, AlpacaStrategyActionCommand);
    };
  }
}
