import { Injectable } from '@nestjs/common';
import { Web3IdentityRepository } from './web3-identity.repository';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { IdentityKeyCommand, IdentityKeyData, IdentityRpcCommand, IdentityRpcData } from './model/web3-identity.model';

@Injectable()
export class Web3IdentityService {
  constructor(
    private repository: Web3IdentityRepository,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  async addIdentityPrivateKey(command: IdentityKeyCommand) {
    const data = this.mapper.map(
      command,
      IdentityKeyCommand,
      IdentityKeyData
    );

    return await this.repository.saveKey(data);
  }

  async addIdentityRpc(command: IdentityRpcCommand) {
    const data = this.mapper.map(
      command,
      IdentityRpcCommand,
      IdentityRpcData
    );

    return await this.repository.saveRpc(data);
  }

  async getIdentityPrivateKey() {
    return await this.repository.findKey();
  }

  async getIdentityRpc() {
    return await this.repository.findAllRpc();
  }
}