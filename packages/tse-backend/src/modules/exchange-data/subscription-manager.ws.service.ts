import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { ExchangeDataService } from './exchange-data.service';
import { MarketDataType } from '../../common/enums/exchange-data.enums';
import { CompositeKeyContext } from '../../common/utils/composite-key/composite-key-context';

@Injectable()
export class ExchangeDataSubscriptionManager {
  private readonly logger = new CustomLogger(
    ExchangeDataSubscriptionManager.name,
  );
  private activeSubscriptions = new Map<string, boolean>();

  constructor(
    @Inject(forwardRef(() => ExchangeDataService))
    private exchangeDataService: ExchangeDataService,
  ) {}

  async handleSubscription(
    type: MarketDataType,
    exchange: string,
    symbol: string,
    symbols: string[],
    timeFrame: string,
    callback: (data: any) => void,
    since: number | undefined,
    limit: number | undefined,
  ) {
    const context = new CompositeKeyContext(type);
    const compositeKey = context.createCompositeKey(
      exchange,
      symbol,
      symbols,
      timeFrame,
    );
    try {
      if (!this.isSubscribed(compositeKey)) {
        this.activeSubscriptions.set(compositeKey, true);
        await this.subscribe(
          type,
          exchange,
          symbol,
          symbols,
          timeFrame,
          callback,
          since,
          limit,
        );
      } else {
        this.logger.warn(
          `Already subscribed to ${type} for ${exchange}:${symbol}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error in subscribing to ${type}: ${error.message}`);
      throw new Error(`Failed to subscribe to ${type}`);
    }
  }

  private async subscribe(
    type: MarketDataType,
    exchange: string,
    symbol: string,
    symbols: string[],
    timeFrame: string,
    callback: (data: any) => void,
    since: number | undefined,
    limit: number | undefined,
  ) {
    const subscribeMethods = {
      [MarketDataType.ORDERBOOK]: () =>
        this.exchangeDataService.watchOrderBook(
          exchange,
          symbol,
          this.createSubscriptionCallback(
            type,
            exchange,
            symbol,
            symbols,
            timeFrame,
            callback,
          ),
        ),
      [MarketDataType.TICKER]: () =>
        this.exchangeDataService.watchTicker(
          exchange,
          symbol,
          this.createSubscriptionCallback(
            type,
            exchange,
            symbol,
            symbols,
            timeFrame,
            callback,
          ),
        ),
      [MarketDataType.OHLCV]: () =>
        this.exchangeDataService.watchOHLCV(
          exchange,
          symbol,
          timeFrame,
          since,
          limit,
          this.createSubscriptionCallback(
            type,
            exchange,
            symbol,
            symbols,
            timeFrame,
            callback,
          ),
        ),
      [MarketDataType.TICKERS]: () =>
        this.exchangeDataService.watchTickers(
          exchange,
          symbols,
          this.createSubscriptionCallback(
            type,
            exchange,
            symbol,
            symbols,
            timeFrame,
            callback,
          ),
        ),
    };

    if (subscribeMethods[type]) {
      await subscribeMethods[type]();
    } else {
      throw new Error(`Unsupported subscription type: ${type}`);
    }
  }

  private createSubscriptionCallback(
    type: MarketDataType,
    exchange: string,
    symbol: string,
    symbols: string[],
    timeFrame: string,
    callback: (data: any) => void,
  ): (data: any) => void {
    return (data: any) => {
      const context = new CompositeKeyContext(type);
      const compositeKey = context.createCompositeKey(
        exchange,
        symbol,
        symbols,
        timeFrame,
      );
      if (this.activeSubscriptions.get(compositeKey)) {
        callback(data);
      } else {
        throw new Error('Subscription is no longer active');
      }
    };
  }

  isSubscribed(compositeKey: string): boolean {
    return this.activeSubscriptions.get(compositeKey);
  }

  unsubscribe(compositeKey: string): void {
    this.activeSubscriptions.set(compositeKey, false);
  }
}
