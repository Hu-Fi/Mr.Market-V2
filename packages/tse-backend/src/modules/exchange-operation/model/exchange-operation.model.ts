import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../../../common/enums/exchange-operation.enums';
import { Decimal } from 'decimal.js';

export class CreateMarketOrderCommand {
  orderType: MarketOrderType;
  userId: string;
  clientId: string;
  exchangeName: string;
  symbol: string;
  side: TradeSideType;
  amount: Decimal;
}

export class CreateLimitOrderCommand extends CreateMarketOrderCommand {
  price: number;
}

export type OrderCommand = CreateMarketOrderCommand | CreateLimitOrderCommand;

export class ExchangeOperationCommand {
  orderEntityId: number;
  status: OrderStatus;
  orderExtId: string;
  details: Record<string, any>;
}

export class CancelOperationCommand {
  status: OrderStatus;
  orderExtId: string;
  details: Record<string, any>;
}

export type OperationCommand =
  | ExchangeOperationCommand
  | CancelOperationCommand;
