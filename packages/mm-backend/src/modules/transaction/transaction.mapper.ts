import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from '@automapper/core';
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

@Injectable()
export class TransactionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, DepositDto, DepositCommand);
      createMap(mapper, WithdrawDto, WithdrawCommand);
      createMap(mapper, CreateDepositDto, CreateDepositCommand);
      createMap(mapper, CreateWithdrawalDto, CreateWithdrawalCommand);
    };
  }
}
