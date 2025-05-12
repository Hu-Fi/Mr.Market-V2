import { Decimal } from 'decimal.js';

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

export interface ExchangeDepositData {
  userId: string;
  exchangeName: string;
  assetId: string;
  chainId: string;
  amount: Decimal;
  destination: string;
  status: string;
  transactionHash?: string;
}

export interface ExchangeWithdrawalData {
  userId: string;
  exchangeName: string;
  assetId: string;
  amount: Decimal;
  destination: string;
  status: string;
}
