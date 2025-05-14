import { Decimal } from 'decimal.js';
import { ExchangeBalanceCommand } from '../../modules/exchange-balance/model/exchange-balance.model';
import {
  TransactionStatus,
  TransactionType,
} from '../enums/exchange-data.enums';

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
  txId: string;
  txTimestamp: string;
  exchangeName: string;
  network: string;
  symbol: string;
  amount: Decimal;
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
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  updated?: number;
  comment?: string;
  fee?: {
    currency: string;
    cost: number;
    rate?: number;
  };
}

export interface BalanceStrategy {
  type: TransactionType;
  getPersisted(
    command: ExchangeBalanceCommand,
  ): Promise<{ amount: Decimal; txTimestamp: string }[]>;
  fetchAndPersist(
    command: ExchangeBalanceCommand,
    lastTxTimestamp?: string,
  ): Promise<{ amount: number }[]>;
}
