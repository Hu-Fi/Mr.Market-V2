import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { CcxtGateway } from '../../integrations/ccxt.gateway';
import { ExchangeApiKeyService } from './exchange-manager/exchange-api-key.service';
import { ExchangeManagerService } from './exchange-manager/exchange-manager.service';
import { ExchangeSelectionStrategy } from './exchange-manager/exchange-selection-strategy.interface';
import { FirstExchangeStrategy } from './exchange-manager/strategies/first-exchange.strategy';
import { EncryptionService } from '../../common/utils/encryption.service';

@Injectable()
export class ExchangeRegistryService {
  private readonly logger = new CustomLogger(ExchangeRegistryService.name);

  constructor(
    private readonly ccxtGateway: CcxtGateway,
    private readonly exchangeApiKeyService: ExchangeApiKeyService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async getExchangeByName(
    exchangeName: string,
    strategy: ExchangeSelectionStrategy = new FirstExchangeStrategy(),
  ) {
    let exchanges = this.ccxtGateway.getExchangeInstances(exchangeName);

    if (!exchanges.length) {
      this.logger.debug(
        `Exchange ${exchangeName} is not configured. Initializing.`,
      );
      exchanges = await this.initializeExchanges(exchangeName);
    }

    const manager = new ExchangeManagerService(exchanges, strategy);
    return manager.getExchange();
  }

  private async initializeExchanges(exchangeName: string) {
    const apiKeys = await this.getApiKeys(exchangeName);
    const initializedExchanges = [];

    for (const apiKey of apiKeys) {
      const exchangeIdentifier = `${exchangeName}-${apiKey}`;
      const exchange = await this.ccxtGateway.initializeExchange(
        exchangeName,
        apiKey.apiKey,
        apiKey.apiSecret,
      );
      initializedExchanges.push(exchange);
      this.ccxtGateway.addExchange(exchangeIdentifier, exchange);
    }

    return initializedExchanges;
  }

  async getApiKeys(exchangeName: string) {
    const data =
      await this.exchangeApiKeyService.getExchangeApiKeys(exchangeName);

    return data.map((apiKey) => ({
      apiKey: apiKey.apiKey,
      apiSecret: this.encryptionService.decrypt(apiKey.apiSecret),
    }));
  }

  getSupportedExchanges(): string[] {
    return Array.from(this.ccxtGateway.getExchangeNames());
  }
}
