import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ExchangeRegistryService } from '../exchange-registry/exchange-registry.service';
import { CustomLogger } from '../logger/logger.service';
import {
  GetMultipleTickerPricesCommand,
  GetOHLCVCommand,
  GetSupportedSymbolsCommand,
  GetTickerPriceCommand,
  GetTickersCommand,
} from './model/exchange-data.model';
import { ExchangeDataSubscriptionManager } from './subscription-manager.ws.service';
import { MarketDataType } from '../../common/enums/exchange-data.enums';
import {
  OHLCVResponse,
  TickerPriceResponse,
} from '../../common/interfaces/exchange-data.interfaces';
import { CompositeKeyContext } from '../../common/utils/composite-key/composite-key-context';

@Injectable()
export class ExchangeDataService {
  private readonly logger = new CustomLogger(ExchangeDataService.name);

  constructor(
    private readonly exchangeRegistryService: ExchangeRegistryService,
    @Inject(forwardRef(() => ExchangeDataSubscriptionManager))
    private readonly subscriptionManager: ExchangeDataSubscriptionManager,
  ) {}

  async getTickers(command: GetTickersCommand) {
    const { exchange, symbols } = command;
    const exchangeInstance = this.exchangeRegistryService.getExchange(exchange);
    if (!exchangeInstance || !exchangeInstance.has.fetchTickers) {
      throw new Error(
        'Exchange does not support fetchTickers or is not configured.',
      );
    }

    this.logger.log(
      `Fetching tickers from ${exchangeInstance.name} for ${symbols}`,
    );

    try {
      return await exchangeInstance.fetchTickers(symbols);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getOHLCVData(command: GetOHLCVCommand) {
    const { exchange, symbol, timeframe = '1m', since, limit = 30 } = command;
    const exchangeInstance = this.exchangeRegistryService.getExchange(exchange);
    if (!exchangeInstance || !exchangeInstance.has.fetchOHLCV) {
      throw new Error(
        'Exchange does not support fetchOHLCV or is not configured.',
      );
    }
    this.logger.log(
      `Fetching OHLCV data from ${exchangeInstance.name} for ${symbol} at ${timeframe} timeframe`,
    );

    try {
      const result = await exchangeInstance.fetchOHLCV(
        symbol,
        timeframe,
        since,
        limit,
      );
      return result.map((data) => {
        return {
          timestamp: data[0],
          open: data[1],
          close: data[2],
          high: data[3],
          low: data[4],
          volume: data[5],
        } as OHLCVResponse;
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getSupportedPairs() {
    const exchangeInstances =
      this.exchangeRegistryService.getSupportedExchanges();
    const pairs: string[] = [];
    this.logger.log(
      `Fetching supported pairs from ${exchangeInstances.length} exchanges`,
    );

    for (const exchange of exchangeInstances) {
      await this.fetchPairsFromExchange(exchange, pairs);
    }
    return Array.from(new Set(pairs));
  }

  private async fetchPairsFromExchange(exchange: string, pairs: string[]) {
    const exchangeInstance = this.exchangeRegistryService.getExchange(exchange);
    if (exchangeInstance && exchangeInstance.has.fetchTickers) {
      try {
        const tickers = await exchangeInstance.fetchTickers();
        pairs.push(...Object.keys(tickers));
      } catch (error) {
        this.logger.error(
          `Error fetching tickers from ${exchange}: ${error}`,
        );
      }
    }
  }

  async getTickerPrice(command: GetTickerPriceCommand) {
    const { exchange, symbol } = command;
    const upperCaseSymbol = symbol.toUpperCase();
    const exchangeInstance = this.exchangeRegistryService.getExchange(exchange);
    if (!exchangeInstance || !exchangeInstance.has.fetchTicker) {
      throw new Error(
        'Exchange does not support fetchTicker or is not configured.',
      );
    }
    this.logger.log(
      `Fetching ticker price from ${exchangeInstance.name} for ${upperCaseSymbol}`,
    );

    try {
      const ticker = await exchangeInstance.fetchTicker(upperCaseSymbol);
      return {
        pair: upperCaseSymbol,
        price: ticker.last,
      } as TickerPriceResponse;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getMultipleTickerPrices(command: GetMultipleTickerPricesCommand) {
    const { exchangeNames, symbols } = command;
    const fetchPromises: Promise<TickerPriceResponse>[] = [];
    const results: {
      [exchange: string]: { [symbol: string]: TickerPriceResponse };
    } = {};

    exchangeNames.forEach((exchangeName) => {
      symbols.forEach((symbol) => {
        const tpCommand = new GetTickerPriceCommand(exchangeName, symbol);
        const fetchPromise = this.getTickerPrice(tpCommand)
          .then((price) => {
            if (!results[exchangeName]) {
              results[exchangeName] = {};
            }
            results[exchangeName][symbol] = price;
            return price;
          })
          .catch((error) => {
            this.logger.error(
              `Error fetching ticker price for ${exchangeName}:${symbol}: ${error}`,
            );
            return null;
          });
        fetchPromises.push(fetchPromise);
      });
    });

    await Promise.all(fetchPromises);
    return results;
  }

  async getSupportedSymbols(command: GetSupportedSymbolsCommand) {
    const { exchange } = command;
    const exchangeInstance = this.exchangeRegistryService.getExchange(exchange);
    if (!exchangeInstance) {
      throw new Error(`Exchange ${exchange} is not configured.`);
    }
    this.logger.log(`Fetching supported symbols from ${exchangeInstance.name}`);

    try {
      await exchangeInstance.loadMarkets();
      return Object.keys(exchangeInstance.markets);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async watchMarketData(
    type: MarketDataType,
    exchange: string,
    symbol: string | undefined,
    symbols: string[] | undefined,
    timeFrame: string | undefined,
    onData: (data: any) => void,
    extraParams: any = {},
  ): Promise<void> {
    const exchangeInstance = this.exchangeRegistryService.getExchange(exchange);
    const methodName = `watch${type}`;
    const context = new CompositeKeyContext(type);
    const compositeKey = context.createCompositeKey(
      exchange,
      symbol,
      symbols,
      timeFrame,
    );

    if (!exchangeInstance || !exchangeInstance.has[methodName]) {
      throw new Error(
        `Exchange ${exchange} does not support ${methodName} or is not configured.`,
      );
    }

    try {
      while (this.subscriptionManager.isSubscribed(compositeKey)) {
        const data = await exchangeInstance[methodName](
          symbol || symbols,
          ...Object.values(extraParams),
        );
        onData(data);
      }
    } catch (error) {
      this.logger.error(
        `Error watching ${type} for ${symbol || symbols} on ${exchange}: ${error.message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Reconnect after a delay
    }
  }

  async watchOrderBook(
    exchange: string,
    symbol: string,
    onData: (data: any) => void,
    limit = 14,
  ): Promise<void> {
    if (exchange === 'bitfinex') {
      limit = 25;
    }
    await this.watchMarketData(
      MarketDataType.ORDERBOOK,
      exchange,
      symbol,
      undefined,
      undefined,
      onData,
      { limit },
    );
  }

  async watchOHLCV(
    exchange: string,
    symbol: string,
    timeframe: string,
    since: number,
    limit: number,
    callback: (data: any) => void,
  ) {
    await this.watchMarketData(
      MarketDataType.OHLCV,
      exchange,
      symbol,
      undefined,
      timeframe,
      callback,
      { since, limit },
    );
  }

  async watchTicker(
    exchange: string,
    symbol: string,
    callback: (data: any) => void,
  ) {
    await this.watchMarketData(
      MarketDataType.TICKER,
      exchange,
      symbol,
      undefined,
      undefined,
      callback,
    );
  }

  async watchTickers(
    exchange: string,
    symbols: string[],
    callback: (data: any) => void,
  ) {
    await this.watchMarketData(
      MarketDataType.TICKERS,
      exchange,
      undefined,
      symbols,
      undefined,
      callback,
    );
  }
}
