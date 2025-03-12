import * as ccxt from 'ccxt';

export interface ExchangeSelectionStrategy {
  selectExchange(instance: any): Promise<ccxt.Exchange | undefined>;
}
