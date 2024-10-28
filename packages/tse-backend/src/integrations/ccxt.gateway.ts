import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import {
  ExchangeErrorException,
  NetworkErrorException,
} from '../common/filters/withdrawal.exception.filter';

@Injectable()
export class CcxtGateway {
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
      const exchangeClass = ccxt.pro[name] || ccxt[name];
      if (!exchangeClass) {
        throw new Error(`Exchange class for ${name} not found`);
      }
      const exchange = new exchangeClass({
        apiKey,
        secret,
      });
      await exchange.loadMarkets();
      return exchange;
    } catch (error) {
      throw new Error(`Failed to initialize ${name}: ${error.message}`);
    }
  }

  interpretError(error: Error, exchangeName: string) {
    const errorMap = new Map([
      [ccxt.NetworkError, () => new NetworkErrorException(exchangeName, error)],
      [ccxt.ExchangeError, () => new ExchangeErrorException(exchangeName, error)],
    ]);

    const ExceptionClass = errorMap.get(error.constructor as any);
    return ExceptionClass ? ExceptionClass() : error;
  }
}
