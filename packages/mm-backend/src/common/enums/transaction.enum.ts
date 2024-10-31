export enum MixinDepositStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
}

export enum MixinWithdrawalStatus {
  SIGNED = 'signed',
  SPENT = 'spent',
}

export enum TransactionStatus {
  PENDING = 'pending',
  OK = 'ok',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export type WithdrawalStatus = MixinWithdrawalStatus | TransactionStatus;
export type DepositStatus = MixinDepositStatus | TransactionStatus;