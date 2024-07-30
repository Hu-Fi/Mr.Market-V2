import { createCompositeKey, decodeCompositeKey } from './subscriptionKey';
import { MarketDataType } from '../enums/exchange-data.enums';

describe('Key Utils', () => {
  describe('createCompositeKey', () => {
    it('should create a composite key for orderbook correctly', () => {
      const type: MarketDataType = MarketDataType.ORDERBOOK;
      const exchange = 'binance';
      const symbol = 'BTC/USD';
      const expectedKey = 'OrderBook:binance:BTC/USD';

      const key = createCompositeKey(type, exchange, symbol);
      expect(key).toEqual(expectedKey);
    });

    it('should create a composite key for OHLCV correctly', () => {
      const type: MarketDataType = MarketDataType.OHLCV;
      const exchange = 'binance';
      const symbol = 'BTC/USD';
      const timeFrame = '1m';
      const expectedKey = 'OHLCV:binance:BTC/USD:1m';

      const key = createCompositeKey(
        type,
        exchange,
        symbol,
        undefined,
        timeFrame,
      );
      expect(key).toEqual(expectedKey);
    });

    it('should create a composite key for tickers correctly', () => {
      const type: MarketDataType = MarketDataType.TICKERS;
      const exchange = 'binance';
      const symbols = ['BTC/USD', 'ETH/USD'];
      const expectedKey = `Tickers:binance:${symbols.toString()}`;

      const key = createCompositeKey(type, exchange, undefined, symbols);
      expect(key).toEqual(expectedKey);
    });
  });

  describe('decodeCompositeKey', () => {
    it('should decode a composite key for orderbook correctly', () => {
      const compositeKey = 'OrderBook:binance:BTC/USD';
      const expected = {
        type: 'OrderBook',
        exchange: 'binance',
        symbol: 'BTC/USD',
      };

      const decodedKey = decodeCompositeKey(compositeKey);
      expect(decodedKey).toEqual(expected);
    });

    it('should decode a composite key for OHLCV correctly', () => {
      const compositeKey = 'OHLCV:binance:BTC/USD:1m';
      const expected = {
        type: 'OHLCV',
        exchange: 'binance',
        symbol: 'BTC/USD',
        timeFrame: '1m',
      };

      const decodedKey = decodeCompositeKey(compositeKey);
      expect(decodedKey).toEqual(expected);
    });

    it('should decode a composite key for tickers correctly', () => {
      const compositeKey = 'Tickers:binance:BTC/USD,ETH/USD';
      const expected = {
        type: 'Tickers',
        exchange: 'binance',
        symbols: ['BTC/USD', 'ETH/USD'],
      };

      const decodedKey = decodeCompositeKey(compositeKey);
      expect(decodedKey).toEqual(expected);
    });
  });
});
