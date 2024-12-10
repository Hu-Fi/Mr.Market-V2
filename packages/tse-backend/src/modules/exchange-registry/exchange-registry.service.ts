import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../logger/logger.service';
import { CcxtGateway } from '../../integrations/ccxt.gateway';
import { ExchangeConfig } from '../../common/interfaces/exchange-registry.interfaces';
import { buildExchangeConfigs } from '../../common/utils/config-utils';

@Injectable()
export class ExchangeRegistryService {
  private readonly logger = new CustomLogger(ExchangeRegistryService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly ccxtGateway: CcxtGateway,
  ) {}

  async initializeExchanges() {
    const exchangeConfigs = buildExchangeConfigs(this.configService);

    await Promise.all(
      Object.values(exchangeConfigs).map(async (config: ExchangeConfig) => {
        if (!config.api || !config.secret) {
          this.logger.warn(
            `API key or secret for ${config.name} is missing. Skipping initialization.`,
          );
          return;
        }
        const exchange = await this.ccxtGateway.initializeExchange(
          config.name,
          config.api,
          config.secret,
        );
        if (exchange) {
          this.ccxtGateway.addExchange(config.name, exchange);
          this.logger.log(
            `${config.name} initialized successfully. ${exchange.has['sandbox'] ? '(sandbox mode)' : ''}`,
          );
        } else {
          this.logger.warn(`Failed to initialize ${config.name}.`);
        }
      }),
    );
  }

  getExchangeByName(name: string) {
    const exchange = this.ccxtGateway.getExchangeByName(name);
    if (!exchange) {
      this.logger.error(`Exchange ${name} is not configured.`);
    }
    return exchange;
  }

  getSupportedExchanges(): string[] {
    return Array.from(this.ccxtGateway.getExchangesNames());
  }

  getSupportedPairs(exchangeName: string) {
    const exchange = this.getExchangeByName(exchangeName);
    if (!exchange) {
      this.logger.error(`Exchange ${exchangeName} is not configured.`);
      throw new Error('Exchange configuration error.');
    }
    return exchange.symbols;
  }
}
