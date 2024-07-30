import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import { CustomLogger } from '../modules/logger/logger.service';

@Injectable()
export class CcxtGateway {
  private readonly logger = new CustomLogger(CcxtGateway.name);
  private readonly exchanges = new Map<string, ccxt.Exchange>();

  addExchange(name: string, exchange: ccxt.Exchange): void {
    this.exchanges.set(name, exchange);
  }

  getExchange(name: string): ccxt.Exchange {
    return this.exchanges.get(name);
  }

  getExchangesNames() {
    return this.exchanges.keys();
  }

  async initializeExchange(
    name: string,
    apiKey: string,
    secret: string,
  ): Promise<ccxt.Exchange | null> {
    try {
      let exchangeClass = ccxt.pro[name];
      if (!exchangeClass) {
        exchangeClass = ccxt[name];
      } else if (!exchangeClass) {
        throw new Error(`Exchange class for ${name} not found`);
      }
      const exchange = new exchangeClass({
        apiKey,
        secret,
      });
      await exchange.loadMarkets();
      return exchange;
    } catch (error) {
      this.logger.warn(`Failed to initialize ${name}: ${error.message}`);
      return null;
    }
  }
}
