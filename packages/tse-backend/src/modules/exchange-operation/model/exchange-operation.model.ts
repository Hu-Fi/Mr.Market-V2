import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../../../common/enums/exchange-operation.enums';

export class CreateMarketOrderCommand {
  orderType: MarketOrderType;
  userId: string;
  clientId: string;
  exchangeName: string;
  symbol: string;
  side: TradeSideType;
  amount: number;
}

export class CreateLimitOrderCommand extends CreateMarketOrderCommand {
  price: number;
}

export type OrderCommand = CreateMarketOrderCommand | CreateLimitOrderCommand;

export class ExchangeOperationCommand {
  orderEntityId: number;
  status: OrderStatus;
  orderId?: string | undefined;
  details: Record<string, any>;
}
