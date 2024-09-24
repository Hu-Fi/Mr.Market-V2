import { Status, Type } from '../enums/transaction.enum';

export interface TransactionBalance {
  userId: string;
  amount: number;
  assetId: string;
}

export interface TransactionData {
  userId: string;
  assetId: string;
  amount: number;
  destination: string;
  type: Type;
  status: Status;
}

export interface DepositResponse {
  assetId: string;
  amount: number;
  destination: string;
}
