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

  async findByName(
    exchangeName: string,
  ): Promise<ExchangeApiKey[] | undefined> {
    return await this.exchangeApiKeyRepository.find({
      where: {
        exchangeName,
        removed: false,
      },
    });
  }

  async find(user: { userId: string; clientId: string }) {
    return await this.exchangeApiKeyRepository.find({
      where: {
        userId: user.userId,
        clientId: user.clientId,
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
