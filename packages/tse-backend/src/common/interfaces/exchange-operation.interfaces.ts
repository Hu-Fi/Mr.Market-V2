import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/exchange-operation.enums';

export interface SaveOperationDto {
  status: OrderStatus;
  details: Record<string, any>;
  order: Order;
}

export interface PersistOperationDto {
  status: OrderStatus;
  details: Record<string, any>;
}
