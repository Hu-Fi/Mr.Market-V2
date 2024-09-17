export enum StrategyTypeEnums {
  ARBITRAGE = 'arbitrage',
  MARKET_MAKING = 'market_making',
}

export enum StrategyInstanceStatus {
  CREATED = 'created',
  RUNNING = 'running',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  DELETED = 'deleted',
}

export enum PriceSourceType {
  MID_PRICE = 'mid_price',
  BEST_ASK = 'best_ask',
  BEST_BID = 'best_bid',
  LAST_PRICE = 'last_price',
}

export enum AmountChangeType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum TimeUnit {
  MILLISECONDS = 1000,
}
