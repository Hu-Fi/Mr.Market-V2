import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { CcxtIntegrationService } from '../../integrations/ccxt.integration.service';
import { ExchangeApiKeyService } from './exchange-manager/exchange-api-key.service';
import { ExchangeManagerService } from './exchange-manager/exchange-manager.service';
import { ExchangeSelectionStrategy } from './exchange-manager/exchange-selection-strategy.interface';
import { GetDefaultAccountStrategy } from './exchange-manager/strategies/get-default-account.strategy';
import { EncryptionService } from '../../common/utils/encryption.service';

@Injectable()
export class ExchangeRegistryService {
  private readonly logger = new CustomLogger(ExchangeRegistryService.name);

  constructor(
    private readonly ccxtGateway: CcxtIntegrationService,
    private readonly exchangeApiKeyService: ExchangeApiKeyService,
    private readonly encryptionService: EncryptionService,
    private readonly defaultStrategy: GetDefaultAccountStrategy,
  ) {}

  async getExchangeByName(
    exchangeName: string,
    strategy: ExchangeSelectionStrategy = this.defaultStrategy,
  ) {
    const freshInitializedExchanges =
      await this.initializeExchanges(exchangeName);
    const manager = new ExchangeManagerService(
      freshInitializedExchanges,
      strategy,
    );
    return manager.getExchange();
  }

  private async initializeExchanges(exchangeName: string) {
    const apiKeys = await this.getApiKeys(exchangeName);
    const initializedExchanges = [];

    const primaryApiKey = apiKeys.find((apiKey) => apiKey.isDefaultAccount);
    if (primaryApiKey) {
      const exchangeIdentifier = `${exchangeName}-true`;
      const exchange = await this.ccxtGateway.initializeExchange(
        exchangeIdentifier,
        {
          name: exchangeName,
          key: primaryApiKey.apiKey,
          secret: primaryApiKey.apiSecret,
        },
      );
      initializedExchanges.push({
        exchangeIdentifier,
        exchange,
      });
      await this.ccxtGateway.addExchange(exchangeIdentifier, 'loadMarkets');
    }

    let index = 1;
    for (const apiKey of apiKeys.filter((apiKey) => !apiKey.isDefaultAccount)) {
      const exchangeIdentifier = `${exchangeName}-false-${index++}`;
      const exchange = await this.ccxtGateway.initializeExchange(
        exchangeIdentifier,
        {
          name: exchangeName,
          key: apiKey.apiKey,
          secret: apiKey.apiSecret,
        },
      );
      initializedExchanges.push({
        exchangeIdentifier,
        exchange,
      });
      await this.ccxtGateway.addExchange(exchangeIdentifier, 'loadMarkets');
    }

    return initializedExchanges;
  }

  async getApiKeys(exchangeName: string) {
    const data =
      await this.exchangeApiKeyService.getExchangeApiKeys(exchangeName);

    return Promise.all(
      data.map(async (apiKey) => ({
        apiKey: apiKey.apiKey,
        apiSecret: await this.encryptionService.decrypt(apiKey.apiSecret),
        isDefaultAccount: apiKey.isDefaultAccount,
      })),
    );
  }

  async getSupportedExchanges(): Promise<string[]> {
    return Array.from(await this.ccxtGateway.getExchangeNames());
  }
}
