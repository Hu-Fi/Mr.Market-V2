import { ExchangeSelectionStrategy } from './exchange-selection-strategy.interface';
import * as ccxt from 'ccxt';

export class ExchangeManagerService {
  private strategy: ExchangeSelectionStrategy;

  constructor(
    private exchangeInstances: ccxt.Exchange[],
    strategy: ExchangeSelectionStrategy,
  ) {
    this.strategy = strategy;
  }

  setStrategy(strategy: ExchangeSelectionStrategy): void {
    this.strategy = strategy;
  }

  getExchange() {
    return this.strategy.selectExchange(this.exchangeInstances);
  }
}
