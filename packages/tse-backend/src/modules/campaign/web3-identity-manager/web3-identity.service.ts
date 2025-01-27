import { Injectable, OnModuleInit } from '@nestjs/common';
import { Web3IdentityRepository } from './web3-identity.repository';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  IdentityKeyCommand,
  IdentityKeyData,
  IdentityRpcCommand,
  IdentityRpcData,
} from './model/web3-identity.model';
import { ethers, Wallet } from 'ethers';

@Injectable()
export class Web3IdentityService implements OnModuleInit {
  private signers: { [key: number]: Wallet } = {};
  constructor(
    private repository: Web3IdentityRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async onModuleInit() {
    await this.initSigners();
  }

  async initSigners() {
    const privateKey = await this.getIdentityPrivateKey();
    const networks = await this.getAllIdentityRpc();

    for (const network of networks) {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      this.signers[network.chainId] = new Wallet(privateKey, provider);
    }
  }

  getSigner(chainId: number): Wallet {
    return this.signers[chainId];
  }

  async addIdentityPrivateKey(command: IdentityKeyCommand) {
    const data = this.mapper.map(command, IdentityKeyCommand, IdentityKeyData);

    await this.repository.saveKey(data);

    await this.initSigners();
  }

  async addIdentityRpc(command: IdentityRpcCommand) {
    const data = this.mapper.map(command, IdentityRpcCommand, IdentityRpcData);

    await this.repository.saveRpc(data);

    await this.initSigners();
  }

  async getIdentityPrivateKey() {
    return await this.repository.findKey();
  }

  async getAllIdentityRpc() {
    return await this.repository.findAllRpc();
  }
}
