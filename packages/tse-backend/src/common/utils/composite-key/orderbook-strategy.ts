import { CompositeKeyStrategy } from './composite-key-strategy.interface';
import { MarketDataType } from '../../enums/exchange-data.enums';
import { CompositeKey } from './composite-key.interfaces';

export class OrderBookStrategy implements CompositeKeyStrategy {
  createKey(exchange: string, symbol?: string): string {
    return `${MarketDataType.ORDERBOOK}:${exchange}:${symbol}`;
  }

  decodeKey(compositeKey: string): CompositeKey {
    const parts = compositeKey.split(':');
    return {
      type: MarketDataType.ORDERBOOK,
      exchange: parts[1],
      symbol: parts[2],
    };
  }
}
