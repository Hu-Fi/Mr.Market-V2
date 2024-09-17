import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';

export const ArbitrageDtoFixture = {
  userId: '123',
  clientId: '456',
  pair: 'ETH/USDT',
  amountToTrade: 1.0,
  minProfitability: 0.01,
  exchangeAName: 'binance',
  exchangeBName: 'mexc',
  checkIntervalSeconds: 10,
  maxOpenOrders: 1,
};

export const ArbitrageCommandFixture = {
  userId: '123',
  clientId: '456',
  sideA: 'ETH',
  sideB: 'USDT',
  amountToTrade: 1.0,
  minProfitability: 0.01,
  exchangeAName: 'binance',
  exchangeBName: 'mexc',
  checkIntervalSeconds: 10,
  maxOpenOrders: 1,
};

export const ArbitragePartialDataFixture = {};

export const ArbitrageDataFixture = {
  id: 1,
  userId: 'user1',
  clientId: 'client1',
  sideA: 'ETH',
  sideB: 'USDT',
  amountToTrade: 10,
  minProfitability: 0.01,
  exchangeAName: 'ExchangeA',
  exchangeBName: 'ExchangeB',
  checkIntervalSeconds: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  status: StrategyInstanceStatus.RUNNING,
};
