import { CompositeKey } from './composite-key.interfaces';

export interface CompositeKeyStrategy {
  createKey(
    exchange: string,
    symbol?: string,
    symbols?: string[],
    timeFrame?: string,
  ): string;
  decodeKey(compositeKey: string): CompositeKey;
}
