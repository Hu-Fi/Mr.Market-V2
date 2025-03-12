export enum MarketOrderType {
  LIMIT_ORDER = 'limit',
  MARKET_ORDER = 'market',
}

export enum OrderStatus {
  PENDING = 'pending',
  OPEN = 'open',
  EXECUTED = 'executed',
  FILLED = 'filled',
  CLOSED = 'closed',
  CANCELED = 'canceled',
  FAILED = 'failed',
}

export enum TradeSideType {
  BUY = 'buy',
  SELL = 'sell',
}
