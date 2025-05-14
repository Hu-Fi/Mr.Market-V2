import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  DepositCommand,
  DepositDto,
} from './deposit/model/mixin-deposit.model';
import {
  WithdrawCommand,
  WithdrawDto,
} from './withdrawal/model/mixin-withdrawal.model';

import { Decimal } from 'decimal.js';

@Injectable()
export class TransactionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        DepositDto,
        DepositCommand,
        forMember(
          (dest) => dest.amount,
          mapFrom((src) => new Decimal(src.amount)),
        ),
      );
      createMap(
        mapper,
        WithdrawDto,
        WithdrawCommand,
        forMember(
          (dest) => dest.amount,
          mapFrom((src) => new Decimal(src.amount)),
        ),
      );
    };
  }
}
