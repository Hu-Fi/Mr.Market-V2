import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  CreateDepositCommand,
  CreateDepositDto,
} from './model/exchange-deposit.model';
import { Decimal } from 'decimal.js';

@Injectable()
export class ExchangeDepositProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateDepositDto, CreateDepositCommand,
        forMember(
          (dest) => dest.amount,
          mapFrom((src) => new Decimal(src.amount)),
        ))
    };
  }
}
