import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  VolumeStrategyActionCommand,
  VolumeStrategyActionDto,
  VolumeStrategyCommand,
  VolumeStrategyDto,
} from './model/volume.model';
import { Decimal } from 'decimal.js';

@Injectable()
export class VolumeStrategyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        VolumeStrategyDto,
        VolumeStrategyCommand,
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
      createMap(mapper, VolumeStrategyActionDto, VolumeStrategyActionCommand);
    };
  }
}
