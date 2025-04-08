import { Injectable } from '@nestjs/common';
import { CcxtIntegrationService } from '../../integrations/ccxt.integration.service';
import { ExchangeApiKeyService } from './exchange-manager/exchange-api-key.service';
import { ExchangeManagerService } from './exchange-manager/exchange-manager.service';
import { GetDefaultAccountStrategy } from './exchange-manager/strategies/get-default-account.strategy';
import { EncryptionService } from '../../common/utils/encryption.service';

@Injectable()
export class ExchangeRegistryService {
  constructor(
    private readonly ccxtGateway: CcxtIntegrationService,
    private readonly exchangeApiKeyService: ExchangeApiKeyService,
    private readonly encryptionService: EncryptionService,
    private readonly defaultStrategy: GetDefaultAccountStrategy,
  ) {}

  async getExchangeByName({
    exchangeName,
    strategy = this.defaultStrategy,
    userId = null,
  }: {
    exchangeName: string;
    strategy?: any;
    userId?: string;
  }): Promise<any> {
    const freshInitializedExchanges = await this.initializeExchanges(
      exchangeName,
      userId,
    );

    const manager = new ExchangeManagerService(
      freshInitializedExchanges,
      strategy,
    );

    return await manager.getExchange();
  }

  private async initializeExchanges(exchangeName: string, userId?: string) {
    const apiKeys = await this.getApiKeys(exchangeName, userId);
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

  async getApiKeys(exchangeName: string, userId?: string) {
    const data = await this.exchangeApiKeyService.getExchangeApiKeys({
      exchangeName,
      userId,
    });

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
