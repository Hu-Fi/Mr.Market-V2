import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
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
import { EncryptionService } from '../../../common/utils/encryption.service';
import { CustomLogger } from '../../logger/logger.service';

@Injectable()
export class Web3IdentityService implements OnModuleInit {
  private readonly logger = new CustomLogger(Web3IdentityService.name);
  private signers: { [key: number]: Wallet } = {};

  constructor(
    private repository: Web3IdentityRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly encryptionService: EncryptionService,
  ) {}

  async onModuleInit() {
    await this.initSigners();
  }

  async initSigners() {
    const privateKey = await this.getIdentityPrivateKey();
    if (!privateKey) {
      this.logger.warn('No web3 private key found. Skipping initialization.');
      return;
    }
    // const decryptedPrivateKey = await this.encryptionService.decrypt(privateKey);
    const networks = await this.getAllIdentityRpc();

    for (const network of networks) {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      // this.signers[network.chainId] = new Wallet(decryptedPrivateKey, provider);
      this.signers[network.chainId] = new Wallet(privateKey, provider);
    }
  }

  getSigner(chainId: number): Wallet {
    return this.signers[chainId];
  }

  async addIdentityPrivateKey(command: IdentityKeyCommand) {
    const data = this.mapper.map(command, IdentityKeyCommand, IdentityKeyData);

    // data.privateKey = await this.encryptionService.encrypt(data.privateKey);

    await this.repository.saveKey(data);

    await this.initSigners();
  }

  async addIdentityRpc(command: IdentityRpcCommand) {
    const data = this.mapper.map(command, IdentityRpcCommand, IdentityRpcData);

    const existingRpc = await this.getAllIdentityRpc();
    if (existingRpc.find((rpc) => rpc.chainId === data.chainId)) {
      throw new BadRequestException(
        `The Web3 rpc already exists: ${data.chainId}. Please remove the existing one to add the new one.`,
      );
    }

    await this.repository.saveRpc(data);

    await this.initSigners();
  }

  private async getIdentityPrivateKey() {
    return await this.repository.findKey();
  }

  private async getAllIdentityRpc() {
    return await this.repository.findAllRpc();
  }

  async getAllRpc() {
    return await this.repository.findAllRpc();
  }

  async removeRpc(id: number) {
    const existingRpc = await this.repository.findOneRpc(id);
    if (!existingRpc) {
      throw new BadRequestException(`Rpc not found: ${id}`);
    }

    existingRpc.removed = true;
    await this.repository.saveRpc(existingRpc);
  }
}
