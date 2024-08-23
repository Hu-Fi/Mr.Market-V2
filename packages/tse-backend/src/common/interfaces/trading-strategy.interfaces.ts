import { Strategy } from '../../modules/trading-strategy/strategy.interface';
import { ArbitrageStrategyCommand } from '../../modules/trading-strategy/strategies/arbitrage/model/arbitrage.dto';
import { StrategyInstanceStatus } from '../enums/strategy-type.enums';

export interface StrategyConfig {
  instance: Strategy;
  intervalId: NodeJS.Timeout;
  status: StrategyInstanceStatus;
}

export type StrategyCommand = ArbitrageStrategyCommand | {};

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
