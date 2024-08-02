import { MarketDataType } from '../../enums/exchange-data.enums';
import { CompositeKeyStrategy } from './composite-key-strategy.interface';
import { CompositeKey } from './composition-key.interfaces';

export class OHLCVStrategy implements CompositeKeyStrategy {
  createKey(
    exchange: string,
    symbol?: string,
    _symbols?: string[],
    timeFrame?: string,
  ): string {
    return `${MarketDataType.OHLCV}:${exchange}:${symbol}:${timeFrame}`;
  }

  decodeKey(compositeKey: string): CompositeKey {
    const parts = compositeKey.split(':');
    return {
      type: MarketDataType.OHLCV,
      exchange: parts[1],
      symbol: parts[2],
      timeFrame: parts[3],
    };
  }
}
