import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import {
  IdentityKeyCommand,
  IdentityKeyData,
  IdentityKeyDto,
  IdentityRpcCommand, IdentityRpcData,
  IdentityRpcDto,
} from './model/web3-identity.model';

@Injectable()
export class Web3IdentityProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, IdentityKeyDto, IdentityKeyCommand);
      createMap(mapper, IdentityKeyCommand, IdentityKeyData);

      createMap(mapper, IdentityRpcDto, IdentityRpcCommand);
      createMap(mapper, IdentityRpcCommand, IdentityRpcData);
    };
  }
}
