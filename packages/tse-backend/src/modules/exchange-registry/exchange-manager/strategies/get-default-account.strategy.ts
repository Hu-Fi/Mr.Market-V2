import { ExchangeSelectionStrategy } from '../exchange-selection-strategy.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDefaultAccountStrategy implements ExchangeSelectionStrategy {
  constructor() {}
  async selectExchange(initializedExchanges: any[]): Promise<any> {
    const filteredExchange = initializedExchanges.filter(
      (exchange: { exchangeIdentifier: string }) =>
        exchange.exchangeIdentifier.split('-')[1] === 'true',
    );
    return filteredExchange.pop()?.exchange;
  }
}
