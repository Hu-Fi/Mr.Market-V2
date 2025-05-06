import { TradeSideType } from '../enums/exchange-operation.enums';
import { Decimal } from 'decimal.js';

export interface ArbitrageTradeParams {
  buyExchange: any;
  sellExchange: any;
  symbol: string;
  amount: Decimal;
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
  amount: Decimal;
  price: number;
}

export interface OrderDetail {
  layer: number;
  currentOrderAmount: Decimal;
  buyPrice: number;
  sellPrice: number;
  shouldBuy: boolean;
  shouldSell: boolean;
}
