import { BadRequestException, Injectable } from '@nestjs/common';
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
export class ExchangeApiKeyReadonlyService {
  constructor(
    private exchangeApiKeyReadonlyRepository: ExchangeApiKeyReadonlyRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly ccxtGateway: CcxtIntegrationService,
    private readonly encryptionService: EncryptionService,
  ) {}

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
        `Exchange API key already exists for exchange: ${exchangeName}.`,
      );
    }

    const data = this.mapper.map(
      command,
      ExchangeApiKeyReadonlyCommand,
      ExchangeApiKeyReadonlyData,
    );

    // data.apiSecret = await this.encryptionService.encrypt(data.apiSecret);

    return await this.exchangeApiKeyReadonlyRepository.save(data);
  }

  async getExchangeApiKeys(exchangeName: string) {
    const existingApiKeys =
      await this.exchangeApiKeyReadonlyRepository.findByName(exchangeName);
    if (!existingApiKeys) {
      throw new BadRequestException(
        `No exchange API keys found for exchange: ${exchangeName}`,
      );
    }

    return existingApiKeys;
  }
}
