import { CompositeKeyStrategy } from './composite-key-strategy.interface';
import { MarketDataType } from '../../enums/exchange-data.enums';
import { CompositeKeyStrategyFactory } from './composite-key-strategy-factory';
import { CompositeKey } from './composition-key.interfaces';

export class CompositeKeyContext {
  private strategy: CompositeKeyStrategy;

  constructor(type: MarketDataType) {
    this.strategy = CompositeKeyStrategyFactory.getStrategy(type);
  }

  createCompositeKey(
    exchange: string,
    symbol?: string,
    symbols?: string[],
    timeFrame?: string,
  ): string {
    return this.strategy.createKey(exchange, symbol, symbols, timeFrame);
  }

  decodeCompositeKey(compositeKey: string): CompositeKey {
    return this.strategy.decodeKey(compositeKey);
  }
}
