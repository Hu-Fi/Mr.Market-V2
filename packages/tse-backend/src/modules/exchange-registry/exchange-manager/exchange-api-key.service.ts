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
    private exchangeApiKeyRepository: ExchangeApiKeyRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly ccxtGateway: CcxtIntegrationService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async addExchangeApiKey(command: ExchangeApiKeyCommand) {
    const { exchangeName, userId, isDefaultAccount } = command;

    if (!this.ccxtGateway.getExchangeClass(exchangeName)) {
      throw new BadRequestException(`Invalid exchange name: ${exchangeName}`);
    }

    const existingExchangeApiKeys = await this.getExchangeApiKeys({
      userId,
      exchangeName,
    });

    if (
      existingExchangeApiKeys.some((apiKey) => apiKey.apiKey === command.apiKey)
    ) {
      throw new BadRequestException(
        `Exchange API key already exists for exchange: ${exchangeName}. Please remove the existing one to add the new one.`,
      );
    }

    if (
      isDefaultAccount &&
      existingExchangeApiKeys.some((apiKey) => apiKey.isDefaultAccount)
    ) {
      throw new BadRequestException(
        `There is already a default exchange API key for ${exchangeName}. Please remove it before adding a new default key.`,
      );
    }

    if (!isDefaultAccount) {
      const hasDefaultKey = existingExchangeApiKeys.some(
        (apiKey) => apiKey.isDefaultAccount,
      );

      if (!hasDefaultKey) {
        throw new BadRequestException(
          `You must first add a default API key for exchange ${exchangeName} before adding additional keys.`,
        );
      }
    }

    const data = this.mapper.map(
      command,
      ExchangeApiKeyCommand,
      ExchangeApiKeyData,
    );

    data.apiSecret = await this.encryptionService.encrypt(data.apiSecret);

    return await this.exchangeApiKeyRepository.save(data);
  }

  async getExchangeApiKeys(options: { exchangeName: string; userId?: string }) {
    const existingApiKeys = await this.exchangeApiKeyRepository.find(options);
    if (!existingApiKeys) {
      throw new BadRequestException(
        `No exchange API keys found for exchange: ${options.exchangeName}`,
      );
    }

    return existingApiKeys;
  }

  async getAllExchangeApiKeys(
    userId: string,
    clientId: string,
  ): Promise<ExchangeApiKeyData[]> {
    return await this.exchangeApiKeyRepository.find({ userId, clientId });
  }

  async removeExchangeApiKey(id: number, userId: string, clientId: string) {
    const existingExchangeApiKey = await this.exchangeApiKeyRepository.findOne(
      id,
      userId,
      clientId,
    );
    if (!existingExchangeApiKey) {
      throw new BadRequestException(`Exchange API key not found: ${id}`);
    }

    existingExchangeApiKey.removed = true;
    await this.exchangeApiKeyRepository.save(existingExchangeApiKey);
  }
}
