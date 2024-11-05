import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from '@automapper/core';
import {
  CreateDepositCommand,
  CreateDepositDto,
} from './model/exchange-deposit.model';

@Injectable()
export class ExchangeDepositProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateDepositDto, CreateDepositCommand);
    };
  }
}
