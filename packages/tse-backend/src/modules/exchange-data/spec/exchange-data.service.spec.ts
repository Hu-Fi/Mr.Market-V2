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

describe('ExchangeDataService', () => {
  let service: ExchangeDataService;
  let exchangeRegistryService: ExchangeRegistryService;

  const mockExchangeRegistryService = {
    getExchange: jest.fn(),
    getSupportedExchanges: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const mockExchangeInstance = {
    name: 'mockExchange',
    has: {
      fetchTickers: true,
      fetchOHLCV: true,
      fetchTicker: true,
    },
    fetchTickers: jest.fn(),
    fetchOHLCV: jest.fn(),
    fetchTicker: jest.fn(),
    loadMarkets: jest.fn(),
    markets: { 'ETH/USDT': {}, 'BTC/USDT': {} },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeDataService,
        {
          provide: ExchangeRegistryService,
          useValue: mockExchangeRegistryService,
        },
        { provide: CustomLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<ExchangeDataService>(ExchangeDataService);
    exchangeRegistryService = module.get<ExchangeRegistryService>(
      ExchangeRegistryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTickers', () => {
    it('should fetch tickers and return them', async () => {
      const command: GetTickersCommand = {
        exchange: 'mockExchange',
        symbols: 'ETH/USDT',
      };
      mockExchangeRegistryService.getExchange.mockReturnValue(
        mockExchangeInstance,
      );
      mockExchangeInstance.fetchTickers.mockResolvedValue({
        'ETH/USDT': { symbol: 'ETH/USDT', last: 100 },
      });

      const result = await service.getTickers(command);

      expect(mockExchangeRegistryService.getExchange).toHaveBeenCalledWith(
        'mockExchange',
      );
      expect(mockExchangeInstance.fetchTickers).toHaveBeenCalledWith([
        'ETH/USDT',
      ]);
      expect(result).toEqual({ 'ETH/USDT': { symbol: 'ETH/USDT', last: 100 } });
    });

    it('should throw an error if exchange does not support fetchTickers', async () => {
      const command: GetTickersCommand = {
        exchange: 'mockExchange',
        symbols: 'ETH/USDT',
      };
      const exchangeInstance = {
        ...mockExchangeInstance,
        has: { fetchTickers: false },
      };
      mockExchangeRegistryService.getExchange.mockReturnValue(exchangeInstance);

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
      mockExchangeRegistryService.getExchange.mockReturnValue(
        mockExchangeInstance,
      );
      mockExchangeInstance.fetchOHLCV.mockResolvedValue([
        [1591512000000, 1, 2, 3, 4, 5],
      ]);

      const result = await service.getOHLCVData(command);

      expect(mockExchangeRegistryService.getExchange).toHaveBeenCalledWith(
        'mockExchange',
      );
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
      mockExchangeRegistryService.getExchange.mockReturnValue(exchangeInstance);

      await expect(service.getOHLCVData(command)).rejects.toThrow(
        'Exchange does not support fetchOHLCV or is not configured.',
      );
    });
  });

  describe('getSupportedPairs', () => {
    it('should fetch supported pairs from all exchanges', async () => {
      mockExchangeRegistryService.getSupportedExchanges.mockReturnValue([
        'mockExchange',
      ]);
      mockExchangeRegistryService.getExchange.mockReturnValue(
        mockExchangeInstance,
      );
      mockExchangeInstance.fetchTickers.mockResolvedValue({
        'ETH/USDT': {},
        'BTC/USDT': {},
      });

      const result = await service.getSupportedPairs();

      expect(
        mockExchangeRegistryService.getSupportedExchanges,
      ).toHaveBeenCalled();
      expect(mockExchangeInstance.fetchTickers).toHaveBeenCalled();
      expect(result).toEqual(['ETH/USDT', 'BTC/USDT']);
    });
  });

  describe('getTickerPrice', () => {
    it('should fetch ticker price and return it', async () => {
      const command: GetTickerPriceCommand = {
        exchange: 'mockExchange',
        symbol: 'ETH/USDT',
      };
      mockExchangeRegistryService.getExchange.mockReturnValue(
        mockExchangeInstance,
      );
      mockExchangeInstance.fetchTicker.mockResolvedValue({ last: 100 });

      const result = await service.getTickerPrice(command);

      expect(mockExchangeRegistryService.getExchange).toHaveBeenCalledWith(
        'mockExchange',
      );
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
      mockExchangeRegistryService.getExchange.mockReturnValue(exchangeInstance);

      await expect(service.getTickerPrice(command)).rejects.toThrow(
        'Exchange does not support fetchTicker or is not configured.',
      );
    });
  });

  describe('getMultipleTickerPrices', () => {
    it('should fetch multiple ticker prices and return them', async () => {
      const command: GetMultipleTickerPricesCommand = {
        exchangeNames: 'mockExchange',
        symbols: 'ETH/USDT,BTC/USDT',
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
      mockExchangeRegistryService.getExchange.mockReturnValue(
        mockExchangeInstance,
      );
      mockExchangeInstance.loadMarkets.mockResolvedValue(undefined);

      const result = await service.getSupportedSymbols(command);

      expect(mockExchangeRegistryService.getExchange).toHaveBeenCalledWith(
        'mockExchange',
      );
      expect(mockExchangeInstance.loadMarkets).toHaveBeenCalled();
      expect(result).toEqual(['ETH/USDT', 'BTC/USDT']);
    });

    it('should throw an error if exchange is not configured', async () => {
      const command: GetSupportedSymbolsCommand = { exchange: 'mockExchange' };
      mockExchangeRegistryService.getExchange.mockReturnValue(undefined);

      await expect(service.getSupportedSymbols(command)).rejects.toThrow(
        'Exchange mockExchange is not configured.',
      );
    });
  });
});
