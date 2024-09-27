import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from '@automapper/core';
import { DepositCommand, DepositDto } from './deposit/model/deposit.model';
import { WithdrawCommand, WithdrawDto } from './withdraw/model/withdraw.model';

@Injectable()
export class TransactionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, DepositDto, DepositCommand);
      createMap(mapper, WithdrawDto, WithdrawCommand);
    };
  }
}
