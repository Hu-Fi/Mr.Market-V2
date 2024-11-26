import { Status } from '../enums/campaign.enums';

export interface Campaign {
  chainId: number;
  endBlock: number;
  status: Status;
  address: string;
  exchangeName: string;
}

export interface ExchangeCredentials {
  apiKey: string;
  secret: string;
}
