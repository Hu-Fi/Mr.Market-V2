import { CustomLogger } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { buildExchangeConfigs } from '../../common/utils/config-utils';
import { CcxtIntegrationService } from '../../integrations/ccxt.integration.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExchangesHealthService {
  private readonly logger = new CustomLogger(ExchangesHealthService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly ccxtGateway: CcxtIntegrationService,
  ) {}

  async checkExchanges() {
    this.logger.debug('Checking exchanges configuration health...');
    const expectedExchanges = buildExchangeConfigs(this.configService);
    const actualExchangesIterator = this.ccxtGateway.getExchangesNames();
    const actualExchanges = Array.from(actualExchangesIterator);

    const missingExchanges = Object.keys(expectedExchanges).filter(
      (exchange) => !actualExchanges.includes(exchange),
    );

    const status = missingExchanges.length === 0 ? 'UP' : 'DOWN';
    const result = { status, details: {} };

    if (status === 'DOWN') {
      result.details = { missingExchanges };
    }

    return result;
  }
}
