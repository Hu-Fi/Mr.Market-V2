import { Status, Type } from '../enums/transaction.enum';

export interface TransactionBalance {
  userId: string;
  amount: number;
  currency: string;
  exchange: string;
}

export interface TransactionData {
  userId: string;
  exchange: string;
  amount: number;
  currency: string;
  type: Type;
  status: Status;
  snapshotId: string;
}
