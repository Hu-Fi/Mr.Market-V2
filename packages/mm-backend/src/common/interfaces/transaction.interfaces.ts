import { Status } from '../enums/deposit.enum';

export interface TransactionBalance {
  userId: string;
  amount: number;
  assetId: string;
}

export interface TransactionData {
  userId: string;
  assetId: string;
  chainId: string;
  amount: number;
  destination: string;
  status: Status;
}

export interface DepositResponse {
  assetId: string;
  amount: number;
  destination: string;
}
