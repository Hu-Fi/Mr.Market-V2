import { ExchangeSelectionStrategy } from '../exchange-selection-strategy.interface';
import * as ccxt from 'ccxt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class GetDefaultAccountStrategy implements ExchangeSelectionStrategy {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
  }
  async selectExchange(initializedExchanges: any): Promise<ccxt.Exchange | undefined> {

    const filteredExchange = initializedExchanges.filter(
      exchange => exchange.exchangeIdentifier.split('-')[1] === 'true'
    )
    return filteredExchange.pop().exchange;
  }
}
