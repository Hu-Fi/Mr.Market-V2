export interface PendingDeposit {
  deposit_id: string;
  transaction_hash: string;
  amount: string;
  confirmations: number;
  threshold: number;
  created_at: string;
}