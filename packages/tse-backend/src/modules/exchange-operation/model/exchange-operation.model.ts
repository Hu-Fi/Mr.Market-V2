import {
  MarketOrderType,
  OrderStatus,
} from '../../../common/enums/exchange-operation.enums';

export class CreateMarketOrderCommand {
  orderType: MarketOrderType;
  userId: string;
  clientId: string;
  exchangeName: string;
  symbol: string;
  side: string;
  amount: number;
}

export class CreateLimitOrderCommand extends CreateMarketOrderCommand {
  price: number;
}

export type OrderCommand = CreateMarketOrderCommand | CreateLimitOrderCommand;

export class ExchangeOperationCommand {
  id: number;
  status: OrderStatus;
  details: Record<string, any>;
}
