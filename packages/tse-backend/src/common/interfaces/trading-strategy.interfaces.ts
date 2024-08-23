import { StrategyInstanceStatus } from '../enums/strategy-type.enums';

export interface StrategyConfig {
  strategyKey: string;
  intervalId: NodeJS.Timeout;
  status: StrategyInstanceStatus;
}

export interface ArbitrageTradeParams {
  buyExchange: any;
  sellExchange: any;
  symbol: string;
  amount: number;
  userId: string;
  clientId: string;
  buyPrice: number;
  sellPrice: number;
}
