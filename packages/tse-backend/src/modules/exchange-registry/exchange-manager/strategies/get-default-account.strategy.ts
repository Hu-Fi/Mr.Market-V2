import { ExchangeSelectionStrategy } from '../exchange-selection-strategy.interface';
import * as ccxt from 'ccxt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDefaultAccountStrategy implements ExchangeSelectionStrategy {
  constructor() {
  }
  async selectExchange(initializedExchanges: any): Promise<ccxt.Exchange | undefined> {

    const filteredExchange = initializedExchanges.filter(
        (exchange: { exchangeIdentifier: string; }) => exchange.exchangeIdentifier.split('-')[1] === 'true'
    )
    return filteredExchange.pop()?.exchange;
  }
}
