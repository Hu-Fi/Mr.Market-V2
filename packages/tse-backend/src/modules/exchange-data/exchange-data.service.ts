import { Injectable } from '@nestjs/common';
import { ExchangeRegistryService } from '../exchange-registry/exchange-registry.service';
import { CustomLogger } from '../logger/logger.service';
import {
  GetMultipleTickerPricesCommand,
  GetOHLCVCommand,
  GetSupportedSymbolsCommand,
  GetTickerPriceCommand,
  GetTickersCommand,
} from './model/exchange-data.model';

@Injectable()
export class ExchangeDataService {
  private readonly logger = new CustomLogger(ExchangeDataService.name);

  constructor(
    private readonly exchangeRegistryService: ExchangeRegistryService,
  ) {}

  async getTickers(command: GetTickersCommand) {
    const { exchange, symbols } = command;
    const exchangeInstance = this.exchangeRegistryService.getExchange(exchange);
    if (!exchangeInstance || !exchangeInstance.has.fetchTickers) {
      throw new Error(
        'Exchange does not support fetchTickers or is not configured.',
      );
    }

    const symbolsArray = symbols.split(',');

    this.logger.log(
      `Fetching tickers from ${exchangeInstance.name} for ${symbols}`,
    );

    try {
      return await exchangeInstance.fetchTickers(symbolsArray);
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
        };
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
      const exchangeInstance =
        this.exchangeRegistryService.getExchange(exchange);
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
    return Array.from(new Set(pairs));
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
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getMultipleTickerPrices(command: GetMultipleTickerPricesCommand) {
    const { exchangeNames, symbols } = command;
    const fetchPromises: Promise<any>[] = [];
    const results: { [exchange: string]: { [symbol: string]: any } } = {};

    const exchangeNamesArray = exchangeNames.split(',');
    const symbolsArray = symbols.split(',');

    exchangeNamesArray.forEach((exchangeName) => {
      symbolsArray.forEach((symbol) => {
        const tpCommand = new GetTickerPriceCommand(exchangeName, symbol);
        const fetchPromise = this.getTickerPrice(tpCommand)
          .then((price) => {
            if (!results[exchangeName]) {
              results[exchangeName] = {};
            }
            results[exchangeName][symbol] = price;
          })
          .catch((error) => {
            this.logger.error(
              `Error fetching ticker price for ${exchangeName}:${symbol}: ${error}`,
            );
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
}
