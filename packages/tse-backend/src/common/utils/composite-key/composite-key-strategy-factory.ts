import { CompositeKeyStrategy } from './composite-key-strategy.interface';
import { OrderBookStrategy } from './orderbook-strategy';
import { TickerStrategy } from './ticker-strategy';
import { OHLCVStrategy } from './ohlcv-strategy';
import { TickersStrategy } from './tickers-strategy';
import { MarketDataType } from '../../enums/exchange-data.enums';

export class CompositeKeyStrategyFactory {
  private static strategies: {
    [key in MarketDataType]?: CompositeKeyStrategy;
  } = {
    [MarketDataType.ORDERBOOK]: new OrderBookStrategy(),
    [MarketDataType.TICKER]: new TickerStrategy(),
    [MarketDataType.OHLCV]: new OHLCVStrategy(),
    [MarketDataType.TICKERS]: new TickersStrategy(),
  };

  public static getStrategy(type: MarketDataType): CompositeKeyStrategy {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new Error(`Strategy for type ${type} not found`);
    }
    return strategy;
  }
}
