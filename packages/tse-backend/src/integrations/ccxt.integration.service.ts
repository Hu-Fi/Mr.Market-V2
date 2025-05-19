import { Inject, Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(CcxtIntegrationService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getExchangeNames(): Promise<Set<string>> {
    if (typeof this.cacheManager.store.keys !== 'function') {
      throw new Error('Cache store does not support key listing.');
    }

    const keys: string[] = await this.cacheManager.store.keys('*');

    const exchangeNames = new Set<string>();

    keys.forEach((key) => {
      const parts = key.split('-');
      if (parts[0] === 'ccxt') {
        exchangeNames.add(parts[1]);
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
        const cacheKey = `ccxt-${exchangeIdentifier}-dependencies`;
        const toRemoveExchange = await this.cacheManager.get(cacheKey);
        if (toRemoveExchange) {
          await this.cacheManager.del(cacheKey);
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
    await this.cacheManager.set(cacheKey, JSON.stringify(exchange.markets));
    await this.clearPrecisionCache();
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

  private getPrecisionCacheKey(
    exchangeId: string,
    pair: string,
    type: 'price' | 'amount',
  ): string {
    return `precision-${exchangeId}-${pair}-${type}`;
  }

  async priceToPrecision(
    exchangeInstance: ccxt.Exchange,
    pair: string,
    price: number | string | Decimal,
  ): Promise<string> {
    const priceStr = price.toString();

    try {
      const cacheKey = this.getPrecisionCacheKey(
        exchangeInstance.id,
        pair,
        'price',
      );

      const cachedData = await this.cacheManager.get<string>(cacheKey);
      if (cachedData) {
        const [cachedPrice, cachedResult] = cachedData.split(':');
        if (cachedPrice === priceStr) {
          return cachedResult;
        }
      }

      const result = exchangeInstance.priceToPrecision(pair, price);

      await this.cacheManager.set(cacheKey, `${priceStr}:${result}`);

      return result;
    } catch (error) {
      this.logger.warn(`Price precision cache failed: ${error.message}`);
      return exchangeInstance.priceToPrecision(pair, price);
    }
  }

  async amountToPrecision(
    exchangeInstance: ccxt.Exchange,
    pair: string,
    amount: number | string | Decimal,
  ): Promise<string> {
    const amountStr = amount.toString();

    try {
      const cacheKey = this.getPrecisionCacheKey(
        exchangeInstance.id,
        pair,
        'amount',
      );

      const cachedData = await this.cacheManager.get<string>(cacheKey);
      if (cachedData) {
        const [cachedAmount, cachedResult] = cachedData.split(':');
        if (cachedAmount === amountStr) {
          return cachedResult;
        }
      }

      const result = exchangeInstance.amountToPrecision(pair, amount);

      await this.cacheManager.set(cacheKey, `${amountStr}:${result}`);

      return result;
    } catch (error) {
      this.logger.warn(`Amount precision cache failed: ${error.message}`);
      return exchangeInstance.amountToPrecision(pair, amount);
    }
  }

  async formatOrderValues(
    exchangeInstance: ccxt.Exchange,
    pair: string,
    price: number | string | Decimal,
    amount: number | string | Decimal,
  ): Promise<{ price: string; amount: string }> {
    const [precisedPrice, precisedAmount] = await Promise.all([
      this.priceToPrecision(exchangeInstance, pair, price),
      this.amountToPrecision(exchangeInstance, pair, amount),
    ]);

    return {
      price: precisedPrice,
      amount: precisedAmount,
    };
  }

  async clearPrecisionCache(): Promise<void> {
    try {
      const keys = await this.cacheManager.store.keys('precision-*');

      for (const key of keys) {
        await this.cacheManager.del(key);
      }

      this.logger.debug(`Precision cache cleared'}`);
    } catch (error) {
      this.logger.warn(`Failed to clear precision cache: ${error.message}`);
    }
  }

  async getExchangeSymbols(exchangeName: string) {
    const marketData = await this.cacheManager.get<string>(
      `ccxt-${exchangeName}-dependencies`,
    );
    const parsedData = JSON.parse(marketData);
    return Object.keys(parsedData);
  }
}
