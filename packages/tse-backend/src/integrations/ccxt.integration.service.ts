import { Inject, Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';
import {
  ExchangeErrorException,
  NetworkErrorException,
} from '../common/filters/withdrawal.exception.filter';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Decimal } from 'decimal.js';

@Injectable()
export class CcxtIntegrationService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async addExchange(name: string, marketsData: string) {
    await this.cacheManager.set(name, marketsData);
  }

  async getExchangeNames(): Promise<Set<string>> {
    if (typeof this.cacheManager.store.keys !== 'function') {
      throw new Error('Cache store does not support key listing.');
    }

    const keys: string[] = await this.cacheManager.store.keys('*');

    const exchangeNames = new Set<string>();

    keys.forEach((key) => {
      const parts = key.split('-');
      if (parts[1] === 'true') {
        exchangeNames.add(parts[0]);
      }
    });

    return exchangeNames;
  }

  async initializeExchange(
    exchangeIdentifier: string,
    config: { name: string; key: string; secret: string },
  ) {
    const exchangeClass = this.getExchangeClass(config.name);
    if (exchangeClass) {
      try {
        const exchange = new exchangeClass({
          apiKey: config.key,
          secret: config.secret,
        });

        this.configureSandboxMode(exchange);

        await this.initExchangeDependencies(config.name, exchange);

        return exchange;
      } catch (e) {
        const toRemoveExchange =
          await this.cacheManager.get(exchangeIdentifier);
        if (toRemoveExchange) {
          await this.cacheManager.del(exchangeIdentifier);
        }
        throw new Error(e);
      }
    } else {
      throw new Error(`Exchange class for ${config.name} not found`);
    }
  }

  getExchangeClass(name: string): typeof ccxt.Exchange | null {
    return ccxt.pro[name] ?? ccxt[name] ?? null;
  }

  async initExchangeDependencies(name: string, exchange: ccxt.Exchange) {
    const cacheKey = `ccxt-${name}-dependencies`;
    const cachedValue = await this.cacheManager.get<string>(cacheKey);
    const marketsCached = cachedValue ? JSON.parse(cachedValue) : null;
    if (marketsCached) {
      exchange.setMarkets(marketsCached);
      return;
    }
    await exchange.loadMarkets();
    await this.cacheManager.set(cacheKey, exchange.markets);
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
    sellPrice: number | string | Decimal,
  ) {
    return exchangeInstance.priceToPrecision(pair, sellPrice);
  }

  amountToPrecision(
    exchangeInstance: ccxt.Exchange,
    pair: string,
    amount: number | string | Decimal,
  ) {
    return exchangeInstance.amountToPrecision(pair, amount);
  }
}
