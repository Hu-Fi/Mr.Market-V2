import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import {
  DepositCommand,
  DepositDto,
} from './mixin-deposit/model/mixin-deposit.model';
import {
  WithdrawCommand,
  WithdrawDto,
} from './mixin-withdraw/model/mixin-withdrawal.model';
import {
  CreateDepositCommand,
  CreateDepositDto,
} from './exchange-deposit/model/exchange-deposit.model';
import {
  CreateWithdrawalCommand,
  CreateWithdrawalDto,
} from './exchange-withdraw/model/exchange-withdrawal.model';
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
      createMap(
        mapper,
        CreateDepositDto,
        CreateDepositCommand,
        forMember(
          (dest) => dest.amount,
          mapFrom((src) => new Decimal(src.amount)),
        ),
      );
      createMap(
        mapper,
        CreateWithdrawalDto,
        CreateWithdrawalCommand,
        forMember(
          (dest) => dest.amount,
          mapFrom((src) => new Decimal(src.amount)),
        ),
      );
    };
  }
}
