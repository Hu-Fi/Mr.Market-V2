import {
  MixinDepositStatus,
  MixinWithdrawalStatus,
} from '../enums/transaction.enum';
import { Decimal } from 'decimal.js';

export interface TransactionBalance {
  userId: string;
  amount: Decimal;
  assetId: string;
}

export interface MixinDepositData {
  userId: string;
  assetId: string;
  chainId: string;
  amount: Decimal;
  destination: string;
  status: MixinDepositStatus;
  transactionHash?: string;
}

export interface MixinWithdrawalData {
  userId: string;
  assetId: string;
  amount: Decimal;
  destination: string;
  status: MixinWithdrawalStatus;
}

export interface MixinDepositResponse {
  assetId: string;
  amount: Decimal;
  destination: string;
}

export interface MixinWithdrawResponse {
  transactionHash: string;
  snapshotId: string;
}
