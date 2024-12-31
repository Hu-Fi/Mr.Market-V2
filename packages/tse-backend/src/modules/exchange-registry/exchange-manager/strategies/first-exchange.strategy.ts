import { ExchangeSelectionStrategy } from '../exchange-selection-strategy.interface';
import * as ccxt from 'ccxt';

export class FirstExchangeStrategy implements ExchangeSelectionStrategy {
  selectExchange(exchanges: ccxt.Exchange[]): ccxt.Exchange | undefined {
    return exchanges[0];
  }
}
