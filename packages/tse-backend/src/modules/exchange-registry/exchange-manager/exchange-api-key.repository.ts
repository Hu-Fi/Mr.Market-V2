import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeApiKey } from '../../../common/entities/exchange-api-key.entity';
import { Repository } from 'typeorm';
import { ExchangeApiKeyData } from './model/exchange-api-key.model';

@Injectable()
export class ExchangeApiKeyRepository {
  constructor(
    @InjectRepository(ExchangeApiKey)
    private readonly exchangeApiKeyRepository: Repository<ExchangeApiKey>,
  ) {}

  save(data: ExchangeApiKeyData) {
    return this.exchangeApiKeyRepository.save(data);
  }

  async find(options: any) {
    return await this.exchangeApiKeyRepository.find({
      where: {
        ...options,
        removed: false,
      },
    });
  }

  async findOne(id: number, userId: string, clientId: string) {
    return await this.exchangeApiKeyRepository.findOne({
      where: {
        id: id,
        userId: userId,
        clientId: clientId,
        removed: false,
      },
    });
  }
}
