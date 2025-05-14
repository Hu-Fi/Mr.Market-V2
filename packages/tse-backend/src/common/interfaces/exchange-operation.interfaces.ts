import { TradeOrder } from '../entities/trade-order.entity';
import { OrderStatus } from '../enums/exchange-operation.enums';

export interface CreateOperationDto {
  status: OrderStatus;
  details: Record<string, any>;
  order: TradeOrder;
}

export interface PersistOperationDto {
  status: OrderStatus;
  details: Record<string, any>;
}
