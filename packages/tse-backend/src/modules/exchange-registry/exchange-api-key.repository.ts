import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeApiKey } from '../../common/entities/exchange-api-key.entity';
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
}
