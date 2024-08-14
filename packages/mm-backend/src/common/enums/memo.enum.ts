export enum TradingType {
  SP = 'Spot',
  SW = 'Swap',
  MM = 'Market Making',
  AR = 'Arbitrage',
  LE = 'Leverage',
  PE = 'Perpetual',
}

export enum SpotOrderType {
  LB = 'Limit Buy',
  LS = 'Limit Sell',
  MB = 'Market Buy',
  MS = 'Market Sell',
}

export enum SpotExchange {
  '01' = 'binance',
  '02' = 'bitfinex',
  '03' = 'mexc',
  '04' = 'okx',
  '05' = 'gate',
  '06' = 'lbank',
}

export enum ArbitrageMemoAction {
  CR = 'create',
  DE = 'deposit',
  WI = 'withdraw',
}

export enum MarketMakingMemoAction {
  CR = 'create',
  DE = 'deposit',
  WI = 'withdraw',
}
