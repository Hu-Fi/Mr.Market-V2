import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3IdentityKey } from '../../../common/entities/web3-identity-key.entity';
import { Repository } from 'typeorm';
import { Web3IdentityRpc } from '../../../common/entities/web3-identity-rpc.entity';
import { IdentityKeyData, IdentityRpcData } from './model/web3-identity.model';

@Injectable()
export class Web3IdentityRepository {
  constructor(
    @InjectRepository(Web3IdentityKey)
    private readonly web3IdentityKeyRepository: Repository<Web3IdentityKey>,
    @InjectRepository(Web3IdentityRpc)
    private readonly web3IdentityRpcRepository: Repository<Web3IdentityRpc>,
  ) {}

  async saveKey(key: IdentityKeyData) {
    const [existingKey] = await this.web3IdentityKeyRepository.find({
        take: 1,
      }
    );
    if (existingKey) {
      await this.web3IdentityKeyRepository.update({ id: existingKey.id }, key);
    } else {
      await this.web3IdentityKeyRepository.save(key);
    }
  }

  async findKey() {
    const [key] = await this.web3IdentityKeyRepository.find({
      take: 1,
    });
    return key ? key.privateKey : null;
  }

  saveRpc(rpc: IdentityRpcData) {
    return this.web3IdentityRpcRepository.save(rpc);
  }

  findAllRpc() {
    return this.web3IdentityRpcRepository.find({
      where: {
        removed: false,
      },
    });
  }
}