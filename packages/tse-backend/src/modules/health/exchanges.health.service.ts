import { CustomLogger } from '../logger/logger.service';
import { Injectable } from '@nestjs/common';
import { CcxtIntegrationService } from '../../integrations/ccxt.integration.service';

@Injectable()
export class ExchangesHealthService {
  private readonly logger = new CustomLogger(ExchangesHealthService.name);
  constructor(private readonly ccxtGateway: CcxtIntegrationService) {}

  async checkExchanges() {
    this.logger.debug('Checking exchanges configuration health...');
    const actualExchanges: Set<string> = this.ccxtGateway.getExchangeNames();

    const status = actualExchanges.size > 0 ? 'UP' : 'DOWN';
    return {
      status,
      details: {
        initialized: Array.from(actualExchanges).join(', '),
      },
    };
  }
}
