import { ExchangeSelectionStrategy } from './exchange-selection-strategy.interface';

export class ExchangeManagerService {
  private strategy: ExchangeSelectionStrategy;

  constructor(
    private exchangeInstances: any,
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
