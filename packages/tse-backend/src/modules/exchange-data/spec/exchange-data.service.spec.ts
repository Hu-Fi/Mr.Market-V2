import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeDataService } from '../exchange-data.service';
import { ExchangeRegistryService } from '../../exchange-registry/exchange-registry.service';
import { CustomLogger } from '../../logger/logger.service';
import {
  GetTickersCommand,
  GetOHLCVCommand,
  GetTickerPriceCommand,
  GetMultipleTickerPricesCommand,
  GetSupportedSymbolsCommand,
} from '../model/exchange-data.model';
import { ExchangeDataSubscriptionManager } from '../subscription-manager.ws.service';
import { MarketDataType } from '../../../common/enums/exchange-data.enums';

describe('ExchangeDataService', () => {
  let service: ExchangeDataService;

  const mockExchangeInstance = {
    name: 'mockExchange',
    has: {
      fetchTickers: true,
      fetchOHLCV: true,
      fetchTicker: true,
      watchOrderBook: true,
      watchOHLCV: true,
      watchTicker: true,
      watchTickers: true,
    },
    fetchTickers: jest.fn().mockResolvedValue(['ETH/USDT', 'BTC/USDT']),
    fetchOHLCV: jest.fn(),
    fetchTicker: jest.fn(),
    watchOrderBook: jest.fn(),
    watchOHLCV: jest.fn(),
    watchTicker: jest.fn(),
    watchTickers: jest.fn(),
    loadMarkets: jest.fn(),
    markets: { 'ETH/USDT': {}, 'BTC/USDT': {} },
  };

  const mockExchangeRegistryService = {
    getExchangeByName: jest.fn().mockResolvedValue(mockExchangeInstance),
    getSupportedExchanges: jest.fn().mockReturnValue(['bybit']),
  };

  const mockSubscriptionManager = {
    isSubscribed: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeDataService,
        {
          provide: ExchangeRegistryService,
          useValue: mockExchangeRegistryService,
        },
        {
          provide: ExchangeDataSubscriptionManager,
          useValue: mockSubscriptionManager,
        },
        { provide: CustomLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<ExchangeDataService>(ExchangeDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTickers', () => {
    it('should fetch tickers and return them', async () => {
      const command: GetTickersCommand = {
        exchange: 'mockExchange',
        symbols: ['ETH/USDT'],
      };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchangeInstance,
      );
      mockExchangeInstance.fetchTickers.mockResolvedValue({
        'ETH/USDT': { symbol: 'ETH/USDT', last: 100 },
      });

      const result = await service.getTickers(command);

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('mockExchange');
      expect(mockExchangeInstance.fetchTickers).toHaveBeenCalledWith([
        'ETH/USDT',
      ]);
      expect(result).toEqual({ 'ETH/USDT': { symbol: 'ETH/USDT', last: 100 } });
    });

    it('should throw an error if exchange does not support fetchTickers', async () => {
      const command: GetTickersCommand = {
        exchange: 'mockExchange',
        symbols: ['ETH/USDT'],
      };
      const exchangeInstance = {
        ...mockExchangeInstance,
        has: { fetchTickers: false },
      };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        exchangeInstance,
      );

      await expect(service.getTickers(command)).rejects.toThrow(
        'Exchange does not support fetchTickers or is not configured.',
      );
    });
  });

  describe('getOHLCVData', () => {
    it('should fetch OHLCV data and return it', async () => {
      const command: GetOHLCVCommand = {
        exchange: 'mockExchange',
        symbol: 'ETH/USDT',
        timeframe: '1d',
        since: 1609459200000,
        limit: 30,
      };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchangeInstance,
      );
      mockExchangeInstance.fetchOHLCV.mockResolvedValue([
        [1591512000000, 1, 2, 3, 4, 5],
      ]);

      const result = await service.getOHLCVData(command);

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('mockExchange');
      expect(mockExchangeInstance.fetchOHLCV).toHaveBeenCalledWith(
        'ETH/USDT',
        '1d',
        1609459200000,
        30,
      );
      expect(result).toEqual([
        {
          timestamp: 1591512000000,
          open: 1,
          close: 2,
          high: 3,
          low: 4,
          volume: 5,
        },
      ]);
    });

    it('should throw an error if exchange does not support fetchOHLCV', async () => {
      const command: GetOHLCVCommand = {
        exchange: 'mockExchange',
        symbol: 'ETH/USDT',
        timeframe: '1d',
        since: 1609459200000,
        limit: 30,
      };
      const exchangeInstance = {
        ...mockExchangeInstance,
        has: { fetchOHLCV: false },
      };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        exchangeInstance,
      );

      await expect(service.getOHLCVData(command)).rejects.toThrow(
        'Exchange does not support fetchOHLCV or is not configured.',
      );
    });
  });

  describe('getSupportedPairs', () => {
    it('should fetch supported pairs from all exchanges', async () => {
      const mockPairsExchange1 = { 'ETH/USDT': {}, 'BTC/USDT': {} };

      mockExchangeRegistryService.getSupportedExchanges.mockReturnValue([
        'exchange1',
        'exchange2',
      ]);

      mockExchangeRegistryService.getExchangeByName.mockResolvedValueOnce({
        ...mockExchangeInstance,
        name: 'exchange1',
        fetchTickers: jest.fn().mockResolvedValue(mockPairsExchange1),
      });

      const result = await service.getSupportedPairs('exchange1');

      expect(result).toEqual(['ETH/USDT', 'BTC/USDT']);
      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('exchange1');
    });
  });

  describe('getTickerPrice', () => {
    it('should fetch ticker price and return it', async () => {
      const command: GetTickerPriceCommand = {
        exchange: 'mockExchange',
        symbol: 'ETH/USDT',
      };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchangeInstance,
      );
      mockExchangeInstance.fetchTicker.mockResolvedValue({ last: 100 });

      const result = await service.getTickerPrice(command);

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('mockExchange');
      expect(mockExchangeInstance.fetchTicker).toHaveBeenCalledWith('ETH/USDT');
      expect(result).toEqual({ pair: 'ETH/USDT', price: 100 });
    });

    it('should throw an error if exchange does not support fetchTicker', async () => {
      const command: GetTickerPriceCommand = {
        exchange: 'mockExchange',
        symbol: 'ETH/USDT',
      };
      const exchangeInstance = {
        ...mockExchangeInstance,
        has: { fetchTicker: false },
      };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        exchangeInstance,
      );

      await expect(service.getTickerPrice(command)).rejects.toThrow(
        'Exchange does not support fetchTicker or is not configured.',
      );
    });
  });

  describe('getMultipleTickerPrices', () => {
    it('should fetch multiple ticker prices and return them', async () => {
      const command: GetMultipleTickerPricesCommand = {
        exchangeNames: ['mockExchange'],
        symbols: ['ETH/USDT', 'BTC/USDT'],
      };
      const tickerPriceCommand1 = new GetTickerPriceCommand(
        'mockExchange',
        'ETH/USDT',
      );
      const tickerPriceCommand2 = new GetTickerPriceCommand(
        'mockExchange',
        'BTC/USDT',
      );

      jest
        .spyOn(service, 'getTickerPrice')
        .mockResolvedValueOnce({ pair: 'ETH/USDT', price: 100 });
      jest
        .spyOn(service, 'getTickerPrice')
        .mockResolvedValueOnce({ pair: 'BTC/USDT', price: 200 });

      const result = await service.getMultipleTickerPrices(command);

      expect(service.getTickerPrice).toHaveBeenCalledWith(tickerPriceCommand1);
      expect(service.getTickerPrice).toHaveBeenCalledWith(tickerPriceCommand2);
      expect(result).toEqual({
        mockExchange: {
          'ETH/USDT': { pair: 'ETH/USDT', price: 100 },
          'BTC/USDT': { pair: 'BTC/USDT', price: 200 },
        },
      });
    });
  });

  describe('getSupportedSymbols', () => {
    it('should fetch supported symbols and return them', async () => {
      const command: GetSupportedSymbolsCommand = { exchange: 'mockExchange' };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchangeInstance,
      );
      mockExchangeInstance.loadMarkets.mockResolvedValue(undefined);

      const result = await service.getSupportedSymbols(command);

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('mockExchange');
      expect(mockExchangeInstance.loadMarkets).toHaveBeenCalled();
      expect(result).toEqual(['ETH/USDT', 'BTC/USDT']);
    });

    it('should throw an error if exchange is not configured', async () => {
      const command: GetSupportedSymbolsCommand = { exchange: 'mockExchange' };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(undefined);

      await expect(service.getSupportedSymbols(command)).rejects.toThrow(
        'Exchange mockExchange is not configured.',
      );
    });
  });

  describe('watchOrderBook', () => {
    it('should call watchMarketData with correct parameters', async () => {
      const spyWatchMarketData = jest
        .spyOn(service as any, 'watchMarketData')
        .mockImplementation(() => Promise.resolve());
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchangeInstance,
      );
      mockSubscriptionManager.isSubscribed.mockReturnValue(true);

      const callback = jest.fn();
      await service.watchOrderBook('binance', 'BTC/USDT', callback);

      expect(spyWatchMarketData).toHaveBeenCalledWith(
        MarketDataType.ORDERBOOK,
        'binance',
        'BTC/USDT',
        undefined,
        undefined,
        callback,
        { limit: 14 },
      );
    });

    it('should adjust limit for bitfinex exchange', async () => {
      const spyWatchMarketData = jest
        .spyOn(service as any, 'watchMarketData')
        .mockImplementation(() => Promise.resolve());
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchangeInstance,
      );
      mockSubscriptionManager.isSubscribed.mockReturnValue(true);

      const callback = jest.fn();
      await service.watchOrderBook('bitfinex', 'BTC/USDT', callback);

      expect(spyWatchMarketData).toHaveBeenCalledWith(
        MarketDataType.ORDERBOOK,
        'bitfinex',
        'BTC/USDT',
        undefined,
        undefined,
        callback,
        { limit: 25 },
      );
    });
  });

  describe('watchOHLCV', () => {
    it('should call watchMarketData with correct parameters', async () => {
      const spyWatchMarketData = jest
        .spyOn(service as any, 'watchMarketData')
        .mockImplementation(() => Promise.resolve());
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchangeInstance,
      );
      mockSubscriptionManager.isSubscribed.mockReturnValue(true);

      const callback = jest.fn();
      await service.watchOHLCV(
        'binance',
        'BTC/USDT',
        '1m',
        1620000000000,
        100,
        callback,
      );

      expect(spyWatchMarketData).toHaveBeenCalledWith(
        MarketDataType.OHLCV,
        'binance',
        'BTC/USDT',
        undefined,
        '1m',
        callback,
        { since: 1620000000000, limit: 100 },
      );
    });
  });

  describe('watchTicker', () => {
    it('should call watchMarketData with correct parameters', async () => {
      const spyWatchMarketData = jest
        .spyOn(service as any, 'watchMarketData')
        .mockImplementation(() => Promise.resolve());
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchangeInstance,
      );
      mockSubscriptionManager.isSubscribed.mockReturnValue(true);

      const callback = jest.fn();
      await service.watchTicker('binance', 'BTC/USDT', callback);

      expect(spyWatchMarketData).toHaveBeenCalledWith(
        MarketDataType.TICKER,
        'binance',
        'BTC/USDT',
        undefined,
        undefined,
        callback,
      );
    });
  });

  describe('watchTickers', () => {
    it('should call watchMarketData with correct parameters', async () => {
      const spyWatchMarketData = jest
        .spyOn(service as any, 'watchMarketData')
        .mockImplementation(() => Promise.resolve());
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchangeInstance,
      );
      mockSubscriptionManager.isSubscribed.mockReturnValue(true);

      const callback = jest.fn();
      await service.watchTickers('binance', ['BTC/USDT', 'ETH/USDT'], callback);

      expect(spyWatchMarketData).toHaveBeenCalledWith(
        MarketDataType.TICKERS,
        'binance',
        undefined,
        ['BTC/USDT', 'ETH/USDT'],
        undefined,
        callback,
      );
    });
  });

  describe('watchMarketData', () => {
    it('should throw an error if the exchange does not support the method', async () => {
      mockExchangeRegistryService.getExchangeByName.mockReturnValue({
        has: { watchOrderBook: false },
      });

      await expect(
        service['watchMarketData'](
          MarketDataType.ORDERBOOK,
          'binance',
          'BTC/USDT',
          undefined,
          undefined,
          jest.fn(),
        ),
      ).rejects.toThrow(
        'Exchange binance does not support watchOrderBook or is not configured.',
      );
    });
  });
});
