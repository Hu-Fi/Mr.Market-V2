import {
  ArbitrageMemoAction,
  MarketMakingMemoAction,
  SpotExchange,
  SpotOrderType,
  TradingType,
} from '../enums/memo.enum';
import { PairsEnum } from '../enums/pairs.enum';

export interface SpotMemoDetails {
  tradingType: TradingType;
  spotOrderType: SpotOrderType;
  exchangeName: SpotExchange;
  destId: PairsEnum;
  limitPrice?: string;
  refId?: string;
}

export interface ArbitrageMemoDetails {
  tradingType: TradingType;
  action: ArbitrageMemoAction;
  exchangeAName: SpotExchange;
  exchangeBName: SpotExchange;
  symbol: PairsEnum;
  traceId: string;
}

export interface MarketMakingMemoDetails {
  tradingType: TradingType;
  action: MarketMakingMemoAction;
  exchangeName: SpotExchange;
  symbol: PairsEnum;
  traceId: string;
}
