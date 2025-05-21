import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  AlpacaStrategyActionCommand,
  AlpacaStrategyActionDto,
  AlpacaStrategyCommand,
  AlpacaStrategyDto,
} from './model/alpaca.model';
import { Decimal } from 'decimal.js';

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
          (destination) => destination.amountToTrade,
          mapFrom((source) => new Decimal(source.amountToTrade)),
        ),
      );
      createMap(mapper, AlpacaStrategyActionDto, AlpacaStrategyActionCommand);
    };
  }
}
