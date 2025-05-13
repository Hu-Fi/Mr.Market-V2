import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from '@automapper/core';
import { ExchangeBalanceCommand, ExchangeBalanceDto,
} from './model/exchange-balance.model';

@Injectable()
export class ExchangeBalanceProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, ExchangeBalanceDto, ExchangeBalanceCommand)
    };
  }
}
