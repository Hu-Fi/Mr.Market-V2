export enum MarketOrderType {
  LIMIT_ORDER = 'limit',
  MARKET_ORDER = 'market',
}

export enum OrderStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum TradeSideType {
  BUY = 'buy',
  SELL = 'sell',
}
