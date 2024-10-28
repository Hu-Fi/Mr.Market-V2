import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from '@automapper/core';
import { CreateWithdrawalCommand, CreateWithdrawalDto } from './model/exchange-withdrawal.model';

@Injectable()
export class ExchangeWithdrawalProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, CreateWithdrawalDto, CreateWithdrawalCommand);
    };
  }
}
