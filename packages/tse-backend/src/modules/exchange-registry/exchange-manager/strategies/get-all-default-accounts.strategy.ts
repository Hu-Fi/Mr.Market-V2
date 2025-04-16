import { ExchangeSelectionStrategy } from '../exchange-selection-strategy.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetAllDefaultAccountsStrategy
  implements ExchangeSelectionStrategy
{
  constructor() {}
  async selectExchange(initializedExchanges: any[]): Promise<any[]> {
    return initializedExchanges.filter(
      (exchange: { exchangeIdentifier: string }) =>
        exchange.exchangeIdentifier.split('-')[1] === 'true',
    );
  }
}
