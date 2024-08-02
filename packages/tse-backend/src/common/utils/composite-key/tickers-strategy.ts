import { MarketDataType } from '../../enums/exchange-data.enums';
import { CompositeKeyStrategy } from './composite-key-strategy.interface';
import { CompositeKey } from './composition-key.interfaces';

export class TickersStrategy implements CompositeKeyStrategy {
  createKey(exchange: string, _symbol?: string, symbols?: string[]): string {
    return `${MarketDataType.TICKERS}:${exchange}:${symbols?.join(',')}`;
  }

  decodeKey(compositeKey: string): CompositeKey {
    const parts = compositeKey.split(':');
    return {
      type: MarketDataType.TICKERS,
      exchange: parts[1],
      symbols: parts[2].split(','),
    };
  }
}
