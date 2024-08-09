import { MarketDataType } from '../enums/exchange-data.enums';

export interface CompositeKey {
  type: MarketDataType;
  exchange: string;
  symbol?: string;
  symbols?: string[];
  timeFrame?: string;
}

export const createCompositeKey = (
  type: MarketDataType,
  exchange: string,
  symbol?: string,
  symbols?: string[],
  timeFrame?: string,
): string => {
  let key = '';
  if (type === MarketDataType.ORDERBOOK || type === MarketDataType.TICKER) {
    key = `${type}:${exchange}:${symbol}`;
  } else if (type === MarketDataType.OHLCV) {
    key = `${type}:${exchange}:${symbol}:${timeFrame}`;
  } else if (type === MarketDataType.TICKERS) {
    key = `${type}:${exchange}:${symbols}`;
  }
  return key;
};

export const decodeCompositeKey = (compositeKey: string): CompositeKey => {
  const parts = compositeKey.split(':');
  const type = parts[0] as MarketDataType;
  const exchange = parts[1];
  const decodedKey: CompositeKey = { type, exchange };

  switch (type) {
    case MarketDataType.ORDERBOOK:
    case MarketDataType.TICKER:
      decodedKey.symbol = parts[2];
      break;
    case MarketDataType.OHLCV:
      decodedKey.symbol = parts[2];
      decodedKey.timeFrame = parts[3];
      break;
    case MarketDataType.TICKERS:
      decodedKey.symbols = parts[2].split(',');
      break;
  }

  return decodedKey;
};
