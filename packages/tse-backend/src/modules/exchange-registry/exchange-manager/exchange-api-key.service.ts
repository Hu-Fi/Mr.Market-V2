import { BadRequestException, Injectable } from '@nestjs/common';
import { ExchangeApiKeyRepository } from './exchange-api-key.repository';
import {
  ExchangeApiKeyCommand,
  ExchangeApiKeyData,
} from './model/exchange-api-key.model';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { EncryptionService } from '../../../common/utils/encryption.service';
import { CcxtIntegrationService } from '../../../integrations/ccxt.integration.service';

@Injectable()
export class ExchangeApiKeyService {
  constructor(
    private repository: ExchangeApiKeyRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly ccxtGateway: CcxtIntegrationService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async addExchangeApiKey(command: ExchangeApiKeyCommand) {
    const { exchangeName } = command;

    if (!this.ccxtGateway.getExchangeClass(exchangeName)) {
      throw new BadRequestException(`Invalid exchange name: ${exchangeName}`);
    }

    const data = this.mapper.map(
      command,
      ExchangeApiKeyCommand,
      ExchangeApiKeyData,
    );

    data.apiSecret = await this.encryptionService.encrypt(data.apiSecret);

    return await this.repository.save(data);
  }

  async getExchangeApiKeys(
    exchangeName: string,
  ): Promise<ExchangeApiKeyData[]> {
    const existingExchangeApiKeys =
      await this.repository.findByName(exchangeName);
    if (!existingExchangeApiKeys) {
      throw new BadRequestException(
        `No exchange API keys found for exchange: ${exchangeName}`,
      );
    }
    return existingExchangeApiKeys;
  }

  async getAllExchangeApiKeys(): Promise<ExchangeApiKeyData[]> {
    return await this.repository.find();
  }

  async removeExchangeApiKey(id: number) {
    const existingExchangeApiKey = await this.repository.findOne(id);
    if (!existingExchangeApiKey) {
      throw new BadRequestException(`Exchange API key not found: ${id}`);
    }

    existingExchangeApiKey.removed = true;
    await this.repository.save(existingExchangeApiKey);
  }
}
