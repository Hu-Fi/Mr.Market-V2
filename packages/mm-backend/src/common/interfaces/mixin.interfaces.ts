export interface Fee {
  asset_id: string;
  amount: string;
}

export interface BalanceDetail {
  asset: string;
  symbol: string;
  balance: string;
  balanceUSD: string;
  balanceBTC: string;
}

export interface UserBalanceResponse {
  balances: BalanceDetail[];
  totalUSDBalance: string;
  totalBTCBalance: string;
}
