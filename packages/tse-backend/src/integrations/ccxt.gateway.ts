import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import {
  ExchangeErrorException,
  NetworkErrorException,
} from '../common/filters/withdrawal.exception.filter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CcxtGateway {
  constructor(private readonly configService: ConfigService) {}
  private readonly exchanges = new Map<string, ccxt.Exchange>();

  addExchange(name: string, exchange: ccxt.Exchange): void {
    this.exchanges.set(name, exchange);
  }

  getExchangeInstances(exchangeName: string): ccxt.Exchange[] | undefined {
    const exchangeInstances: ccxt.Exchange[] = [];
    for (const [key, exchangeInstance] of this.exchanges.entries()) {
      const identifier = key.split('-')[0];
      if (identifier?.startsWith(exchangeName)) {
        exchangeInstances.push(exchangeInstance);
      }
    }
    return exchangeInstances;
  }

  getExchangeNames(): Set<string> {
    const uniqueNames = new Set<string>();
    for (const key of this.exchanges.keys()) {
      const exchangeName = key.split('-')[0];
      uniqueNames.add(exchangeName);
    }
    return uniqueNames;
  }

  async initializeExchange(name: string, apiKey: string, secret: string) {
    const exchangeClass = this.getExchangeClass(name);
    if (exchangeClass) {
      const exchange = new exchangeClass({ apiKey, secret });
      this.configureSandboxMode(exchange);
      await exchange.loadMarkets();
      return exchange;
    } else {
      throw new Error(`Exchange class for ${name} not found`);
    }
  }

  getExchangeClass(name: string): typeof ccxt.Exchange | null {
    return ccxt.pro[name] ?? ccxt[name] ?? null;
  }

  private configureSandboxMode(exchange: ccxt.Exchange): void {
    const isSandbox = this.configService.get('SANDBOX', false) === 'true';
    if (exchange.has['sandbox']) {
      exchange.setSandboxMode(isSandbox);
    }
  }

  interpretError(error: Error, exchangeName: string) {
    const errorMap = new Map([
      [ccxt.NetworkError, () => new NetworkErrorException(exchangeName, error)],
      [
        ccxt.ExchangeError,
        () => new ExchangeErrorException(exchangeName, error),
      ],
    ]);

    const ExceptionClass = errorMap.get(error.constructor as any);
    return ExceptionClass ? ExceptionClass() : error;
  }

  priceToPrecision(
    exchangeInstance: ccxt.Exchange,
    pair: string,
    sellPrice: any,
  ) {
    return exchangeInstance.priceToPrecision(pair, sellPrice);
  }

  amountToPrecision(
    exchangeInstance: ccxt.Exchange,
    pair: string,
    amount: any,
  ) {
    return exchangeInstance.amountToPrecision(pair, amount);
  }
}
