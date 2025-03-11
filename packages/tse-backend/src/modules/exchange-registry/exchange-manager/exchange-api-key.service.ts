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
import {
  ExchangeApiKeyReadonlyCommand,
  ExchangeApiKeyReadonlyData,
} from './model/exchange-api-key-readonly.model';
import { ExchangeApiKeyReadonlyRepository } from './exchange-api-key-readonly.repository';

@Injectable()
export class ExchangeApiKeyService {
  constructor(
    private exchangeApiKeyRepository: ExchangeApiKeyRepository,
    private exchangeApiKeyReadonlyRepository: ExchangeApiKeyReadonlyRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly ccxtGateway: CcxtIntegrationService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async addExchangeApiKey(command: ExchangeApiKeyCommand) {
    const { exchangeName } = command;

    if (!this.ccxtGateway.getExchangeClass(exchangeName)) {
      throw new BadRequestException(`Invalid exchange name: ${exchangeName}`);
    }

    const existingExchangeApiKeys = await this.getExchangeApiKeys(exchangeName);

    if (
      existingExchangeApiKeys.some((apiKey) => apiKey.apiKey === command.apiKey)
    ) {
      throw new BadRequestException(
        `Exchange API key already exists for exchange: ${exchangeName}. Please remove the existing one to add the new one.`,
      );
    }

    const data = this.mapper.map(
      command,
      ExchangeApiKeyCommand,
      ExchangeApiKeyData,
    );

    data.apiSecret = await this.encryptionService.encrypt(data.apiSecret);

    return await this.exchangeApiKeyRepository.save(data);
  }

  async getExchangeApiKeys(
    exchangeName: string,
  ) {
    const existingExchangeApiKeys =
      await this.exchangeApiKeyRepository.findByName(exchangeName);
    const existingExchangeReadOnlyApiKeys =
      await this.exchangeApiKeyReadonlyRepository.findByName(exchangeName);
    if (!existingExchangeApiKeys && !existingExchangeReadOnlyApiKeys) {
      throw new BadRequestException(
        `No exchange API keys found for exchange: ${exchangeName}`,
      );
    }
    return [
      ...(existingExchangeApiKeys || []),
      ...(existingExchangeReadOnlyApiKeys || []),
    ];
  }

  async getAllExchangeApiKeys(): Promise<ExchangeApiKeyData[]> {
    return await this.exchangeApiKeyRepository.find();
  }

  async removeExchangeApiKey(id: number) {
    const existingExchangeApiKey =
      await this.exchangeApiKeyRepository.findOne(id);
    if (!existingExchangeApiKey) {
      throw new BadRequestException(`Exchange API key not found: ${id}`);
    }

    existingExchangeApiKey.removed = true;
    await this.exchangeApiKeyRepository.save(existingExchangeApiKey);
  }

  async addExchangeApiKeyReadonly(command: ExchangeApiKeyReadonlyCommand) {
    const { exchangeName } = command;

    if (!this.ccxtGateway.getExchangeClass(exchangeName)) {
      throw new BadRequestException(`Invalid exchange name: ${exchangeName}`);
    }

    const existingExchangeApiKeys = await this.getExchangeApiKeys(exchangeName);

    if (
      existingExchangeApiKeys.some((apiKey) => apiKey.apiKey === command.apiKey)
    ) {
      throw new BadRequestException(
        `Exchange API key already exists for exchange: ${exchangeName}. Please remove the existing one to add the new one.`,
      );
    }

    const data = this.mapper.map(
      command,
      ExchangeApiKeyReadonlyCommand,
      ExchangeApiKeyReadonlyData,
    );

    // TODO: pass userId, clientId from JWT token
    data.userId = 'temporaryValue';
    data.clientId = 'temporaryValue';

    data.apiSecret = await this.encryptionService.encrypt(data.apiSecret);
    return await this.exchangeApiKeyReadonlyRepository.save(data);
  }
}
