export enum StrategyTypeEnums {
  ARBITRAGE = 'arbitrage',
  MARKET_MAKING = 'market_making',
}

export enum StrategyInstanceStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
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
