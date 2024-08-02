import { CompositeKeyStrategy } from './composite-key-strategy.interface';
import { MarketDataType } from '../../enums/exchange-data.enums';
import { CompositeKey } from './composition-key.interfaces';

export class TickerStrategy implements CompositeKeyStrategy {
  createKey(exchange: string, symbol?: string): string {
    return `${MarketDataType.TICKER}:${exchange}:${symbol}`;
  }

  decodeKey(compositeKey: string): CompositeKey {
    const parts = compositeKey.split(':');
    return {
      type: MarketDataType.TICKER,
      exchange: parts[1],
      symbol: parts[2],
    };
  }
}
