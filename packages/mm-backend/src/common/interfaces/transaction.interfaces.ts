import { DepositStatus, WithdrawalStatus } from '../enums/transaction.enum';

export interface TransactionBalance {
  userId: string;
  amount: number;
  assetId: string;
}

export interface DepositData {
  userId: string;
  assetId: string;
  chainId: string;
  amount: number;
  destination: string;
  status: DepositStatus;
}

export interface WithdrawData {
  userId: string;
  assetId: string;
  amount: number;
  destination: string;
  status: WithdrawalStatus;
}

export interface DepositResponse {
  assetId: string;
  amount: number;
  destination: string;
}

export interface WithdrawResponse {
  transactionHash: string;
  snapshotId: string;
}
