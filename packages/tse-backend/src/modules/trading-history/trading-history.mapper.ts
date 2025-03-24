import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from '@automapper/core';
import {
  GetUserTradingHistoryQueryCommand,
  GetUserTradingHistoryQueryDto,
} from './model/trading-history.model';

@Injectable()
export class TradingHistoryProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        GetUserTradingHistoryQueryDto,
        GetUserTradingHistoryQueryCommand,
      );
    };
  }
}
