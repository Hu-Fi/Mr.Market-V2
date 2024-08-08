import { MarketDataType } from '../../enums/exchange-data.enums';

export interface CompositeKey {
  type: MarketDataType;
  exchange: string;
  symbol?: string;
  symbols?: string[];
  timeFrame?: string;
}
