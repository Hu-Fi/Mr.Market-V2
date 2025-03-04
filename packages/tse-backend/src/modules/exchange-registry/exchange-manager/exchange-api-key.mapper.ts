import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import {
  ExchangeApiKeyCommand,
  ExchangeApiKeyData,
  ExchangeApiKeyDto,
} from './model/exchange-api-key.model';
import {
  ExchangeApiKeyReadonlyCommand,
  ExchangeApiKeyReadonlyData,
  ExchangeApiKeyReadonlyDto,
} from './model/exchange-api-key-readonly.model';

@Injectable()
export class ExchangeApiKeyProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, ExchangeApiKeyDto, ExchangeApiKeyCommand);
      createMap(mapper, ExchangeApiKeyCommand, ExchangeApiKeyData);
      createMap(
        mapper,
        ExchangeApiKeyReadonlyDto,
        ExchangeApiKeyReadonlyCommand,
      );
      createMap(
        mapper,
        ExchangeApiKeyReadonlyCommand,
        ExchangeApiKeyReadonlyData,
      );
    };
  }
}
