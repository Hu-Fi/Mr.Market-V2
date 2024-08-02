import { CompositeKeyContext } from './composite-key-context';
import { MarketDataType } from '../../enums/exchange-data.enums';

describe('CompositeKeyContext', () => {
  describe('createCompositeKey', () => {
    it('should create a composite key for orderbook correctly', () => {
      const context = new CompositeKeyContext(MarketDataType.ORDERBOOK);
      const exchange = 'binance';
      const symbol = 'BTC/USD';
      const expectedKey = 'OrderBook:binance:BTC/USD';

      const key = context.createCompositeKey(exchange, symbol);
      expect(key).toEqual(expectedKey);
    });

    it('should create a composite key for ticker correctly', () => {
      const context = new CompositeKeyContext(MarketDataType.TICKER);
      const exchange = 'binance';
      const symbol = 'BTC/USD';
      const expectedKey = 'Ticker:binance:BTC/USD';

      const key = context.createCompositeKey(exchange, symbol);
      expect(key).toEqual(expectedKey);
    });

    it('should create a composite key for OHLCV correctly', () => {
      const context = new CompositeKeyContext(MarketDataType.OHLCV);
      const exchange = 'binance';
      const symbol = 'BTC/USD';
      const timeFrame = '1m';
      const expectedKey = 'OHLCV:binance:BTC/USD:1m';

      const key = context.createCompositeKey(
        exchange,
        symbol,
        undefined,
        timeFrame,
      );
      expect(key).toEqual(expectedKey);
    });

    it('should create a composite key for tickers correctly', () => {
      const context = new CompositeKeyContext(MarketDataType.TICKERS);
      const exchange = 'binance';
      const symbols = ['BTC/USD', 'ETH/USD'];
      const expectedKey = `Tickers:binance:${symbols.toString()}`;

      const key = context.createCompositeKey(exchange, undefined, symbols);
      expect(key).toEqual(expectedKey);
    });
  });

  describe('decodeCompositeKey', () => {
    it('should decode a composite key for orderbook correctly', () => {
      const context = new CompositeKeyContext(MarketDataType.ORDERBOOK);
      const compositeKey = 'OrderBook:binance:BTC/USD';
      const expected = {
        type: MarketDataType.ORDERBOOK,
        exchange: 'binance',
        symbol: 'BTC/USD',
      };

      const decodedKey = context.decodeCompositeKey(compositeKey);
      expect(decodedKey).toEqual(expected);
    });

    it('should decode a composite key for ticker correctly', () => {
      const context = new CompositeKeyContext(MarketDataType.TICKER);
      const compositeKey = 'Ticker:binance:BTC/USD';
      const expected = {
        type: MarketDataType.TICKER,
        exchange: 'binance',
        symbol: 'BTC/USD',
      };

      const decodedKey = context.decodeCompositeKey(compositeKey);
      expect(decodedKey).toEqual(expected);
    });

    it('should decode a composite key for OHLCV correctly', () => {
      const context = new CompositeKeyContext(MarketDataType.OHLCV);
      const compositeKey = 'OHLCV:binance:BTC/USD:1m';
      const expected = {
        type: MarketDataType.OHLCV,
        exchange: 'binance',
        symbol: 'BTC/USD',
        timeFrame: '1m',
      };

      const decodedKey = context.decodeCompositeKey(compositeKey);
      expect(decodedKey).toEqual(expected);
    });

    it('should decode a composite key for tickers correctly', () => {
      const context = new CompositeKeyContext(MarketDataType.TICKERS);
      const compositeKey = 'Tickers:binance:BTC/USD,ETH/USD';
      const expected = {
        type: MarketDataType.TICKERS,
        exchange: 'binance',
        symbols: ['BTC/USD', 'ETH/USD'],
      };

      const decodedKey = context.decodeCompositeKey(compositeKey);
      expect(decodedKey).toEqual(expected);
    });
  });
});
