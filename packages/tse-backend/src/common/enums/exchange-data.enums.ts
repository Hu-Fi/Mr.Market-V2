export enum MarketDataType {
  ORDERBOOK = 'OrderBook',
  OHLCV = 'OHLCV',
  TICKER = 'Ticker',
  TICKERS = 'Tickers',
}

export enum ExchangeNetwork {
  ERC20 = 'ERC20',
  TRC20 = 'TRC20',
  BEP20 = 'BEP20',
  BEP2 = 'BEP2',
  HECO = 'HECO',
  OMNI = 'OMNI',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CANCELED = 'canceled',
  FAILED = 'failed',
  OK = 'ok',
}
