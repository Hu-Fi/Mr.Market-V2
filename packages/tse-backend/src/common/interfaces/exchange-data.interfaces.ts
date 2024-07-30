export interface OHLCVResponse {
  timestamp: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface TickerPriceResponse {
  pair: string;
  price: number;
}
