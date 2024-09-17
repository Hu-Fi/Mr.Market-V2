import { StrategyInstanceStatus } from '../enums/strategy-type.enums';
import { TradeSideType } from '../enums/exchange-operation.enums';

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

export interface PlaceOrderParams {
  userId: string;
  clientId: string;
  exchangeName: string;
  pair: string;
  side: TradeSideType;
  amount: number;
  price: number;
}

export interface OrderDetail {
  layer: number;
  currentOrderAmount: number;
  buyPrice: number;
  sellPrice: number;
  shouldBuy: boolean;
  shouldSell: boolean;
}
