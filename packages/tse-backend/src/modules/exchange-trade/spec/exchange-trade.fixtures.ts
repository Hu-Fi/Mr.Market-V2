import {
  CancelOrderDto,
  MarketLimitDto,
  MarketTradeDto,
} from '../model/exchange-trade.model';
import { TradeSideType } from '../../../common/enums/exchange-operation.enums';
import { Decimal } from 'decimal.js';
import { RequestWithUser } from '../../../common/interfaces/http-request.interfaces';

export const marketTradeDtoFixture: MarketTradeDto = {
  exchange: 'binance',
  symbol: 'BTC/USDT',
  side: TradeSideType.BUY,
  amount: String(1),
};

export const marketLimitDtoFixture: MarketLimitDto = {
  exchange: 'binance',
  symbol: 'BTC/USDT',
  side: TradeSideType.BUY,
  amount: String(1),
  price: 30000,
};

export const cancelOrderDtoFixture: CancelOrderDto = {
  exchange: 'binance',
  orderId: 'order789',
  symbol: 'BTC/USDT',
};

export const marketTradeCommandFixture = {
  userId: 'user123',
  clientId: 'client456',
  exchange: 'binance',
  symbol: 'BTC/USDT',
  side: TradeSideType.BUY,
  amount: new Decimal(1),
};

export const marketLimitCommandFixture = {
  userId: 'user123',
  clientId: 'client456',
  exchange: 'binance',
  symbol: 'BTC/USDT',
  side: TradeSideType.BUY,
  amount: new Decimal(1),
  price: 30000,
};

export const cancelOrderCommandFixture = {
  userId: 'user123',
  clientId: 'client456',
  exchange: 'binance',
  orderId: 'order789',
  symbol: 'BTC/USDT',
};

export const mockReq = {
  user: { userId: 'user123', clientId: 'client456' },
} as RequestWithUser;
