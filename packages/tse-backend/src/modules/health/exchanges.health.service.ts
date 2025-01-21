import { CustomLogger } from '../logger/logger.service';
import { CcxtGateway } from '../../integrations/ccxt.gateway';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExchangesHealthService {
  private readonly logger = new CustomLogger(ExchangesHealthService.name);
  constructor(private readonly ccxtGateway: CcxtGateway) {}

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
