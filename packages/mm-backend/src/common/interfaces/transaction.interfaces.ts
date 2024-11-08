import {
  ExchangeDepositStatus,
  ExchangeWithdrawalStatus,
  MixinDepositStatus,
  MixinWithdrawalStatus,
} from '../enums/transaction.enum';

export interface TransactionBalance {
  userId: string;
  amount: number;
  assetId: string;
}

export interface MixinDepositData {
  userId: string;
  assetId: string;
  chainId: string;
  amount: number;
  destination: string;
  status: MixinDepositStatus;
  transactionHash?: string;
}

export interface MixinWithdrawalData {
  userId: string;
  assetId: string;
  amount: number;
  destination: string;
  status: MixinWithdrawalStatus;
}

export interface MixinDepositResponse {
  assetId: string;
  amount: number;
  destination: string;
}

export interface MixinWithdrawResponse {
  transactionHash: string;
  snapshotId: string;
}

export interface ExchangeDepositData {
  userId: string;
  exchangeName: string;
  assetId: string;
  chainId: string;
  amount: number;
  destination: string;
  status: ExchangeDepositStatus;
  transactionHash?: string;
}

export interface ExchangeWithdrawalData {
  userId: string;
  exchangeName: string;
  assetId: string;
  amount: number;
  destination: string;
  status: ExchangeWithdrawalStatus;
}
