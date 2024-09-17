import { Strategy } from '../../strategy.interface';

interface ArbitrageStrategy {
  userId: string;
  clientId: string;
  pair: string;
  amountToTrade: number;
  minProfitability: number;
  exchangeAName: string;
  exchangeBName: string;
}

export class ArbitrageStrategyFixtureDto implements ArbitrageStrategy {
  userId: string;
  clientId: string;
  pair: string;
  amountToTrade: number;
  minProfitability: number;
  exchangeAName: string;
  exchangeBName: string;

  constructor(
    userId: string = 'user123',
    clientId: string = 'client456',
    pair: string = 'BTC/USDT',
    amountToTrade: number = 1.0,
    minProfitability: number = 0.01,
    exchangeAName: string = 'binance',
    exchangeBName: string = 'mexc',
  ) {
    this.userId = userId;
    this.clientId = clientId;
    this.pair = pair;
    this.amountToTrade = amountToTrade;
    this.minProfitability = minProfitability;
    this.exchangeAName = exchangeAName;
    this.exchangeBName = exchangeBName;
  }
}

export class MockArbitrageStrategy implements Strategy {
  constructor(private strategyParamsDto: ArbitrageStrategy) {}

  async start(): Promise<void> {}

  async stop(): Promise<void> {}

  async pause(): Promise<void> {}
}
