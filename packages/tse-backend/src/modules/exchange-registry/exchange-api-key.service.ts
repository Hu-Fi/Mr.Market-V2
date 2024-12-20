import { Injectable } from '@nestjs/common';
import { ExchangeApiKeyRepository } from './exchange-api-key.repository';
import { ExchangeApiKeyCommand, ExchangeApiKeyData } from './model/exchange-api-key.model';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';


@Injectable()
export class ExchangeApiKeyService {
  constructor(
    private repository: ExchangeApiKeyRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async addExchangeApiKey(command: ExchangeApiKeyCommand) {
    const data = this.mapper.map(command, ExchangeApiKeyCommand, ExchangeApiKeyData);
    return await this.repository.save(data);
  }
}
