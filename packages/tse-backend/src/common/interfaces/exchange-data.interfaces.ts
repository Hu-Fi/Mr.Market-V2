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
  txId: string;
  txTimestamp: string;
  exchangeName: string;
  network: string;
  symbol: string;
  amount: Decimal;
}

export interface ExchangeWithdrawalData {
  userId: string;
  exchangeName: string;
  assetId: string;
  amount: Decimal;
  destination: string;
  status: string;
}

export interface Transaction {
  info: Record<string, any>;
  id: string;
  txid: string;
  timestamp: number;
  datetime: string;
  addressFrom?: string;
  address: string;
  addressTo?: string;
  tagFrom?: string;
  tag?: string;
  tagTo?: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  status: 'ok' | 'failed' | 'canceled' | 'pending';
  updated?: number;
  comment?: string;
  fee?: {
    currency: string;
    cost: number;
    rate?: number;
  };
}
