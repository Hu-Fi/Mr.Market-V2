import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
          this.logger.log(`${config.name} initialized successfully.`);
        } else {
          this.logger.warn(`Failed to initialize ${config.name}.`);
        }
      }),
    );
  }

  getExchange(exchangeName: string) {
    const exchange = this.ccxtGateway.getExchange(exchangeName);
    if (!exchange) {
      this.logger.error(`Exchange ${exchangeName} is not configured.`);
      throw new InternalServerErrorException('Exchange configuration error.');
    }
    return exchange;
  }

  getSupportedExchanges(): string[] {
    return Array.from(this.ccxtGateway.getExchangesNames());
  }
}
