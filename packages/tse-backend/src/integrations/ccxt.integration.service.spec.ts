import { Test, TestingModule } from '@nestjs/testing';
import * as ccxt from 'ccxt';
import { CcxtIntegrationService } from './ccxt.integration.service';
import { CustomLogger } from '../modules/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: any) => {
    if (key === 'SANDBOX') return process.env.SANDBOX || 'false';
    return defaultValue;
  }),
};

const mockCacheManager: Cache = {
  set: jest.fn((key: string, value: any) => {
    mockCacheManager.store[key] = value;
  }),
  get: jest.fn((key: string) => {
    return mockCacheManager.store[key];
  }),
  del: jest.fn((key: string) => {
    delete mockCacheManager.store[key];
  }),
  store: {
    keys: jest.fn(() => {
      return Object.keys(mockCacheManager.store);
    }),
  },
} as any;

jest.mock('ccxt', () => {
  const mockBinance = jest.fn().mockImplementation(({ apiKey, secret }) => {
    return {
      apiKey,
      secret,
      markets: null,
      loadMarkets: jest.fn().mockImplementation(function () {
        this.markets = { someMarket: 'data' };
        return Promise.resolve(true);
      }),
      setSandboxMode: jest.fn(),
      has: { sandbox: true },
      setMarkets: jest.fn(function (markets) {
        this.markets = markets;
      }),
    };
  });

  return {
    binance: mockBinance,
    pro: {
      binance: mockBinance,
    },
  };
});

describe('CcxtIntegrationService', () => {
  let service: CcxtIntegrationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CcxtIntegrationService,
        { provide: CustomLogger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<CcxtIntegrationService>(CcxtIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExchangeNames', () => {
    it('should return a set of exchange names from cache keys ending with "-true"', async () => {
      (mockCacheManager.store.keys as jest.Mock).mockResolvedValue([
        'binance-true',
        'kraken-true',
        'other-false',
      ]);
      const names = await service.getExchangeNames();
      expect(names).toEqual(new Set(['binance', 'kraken']));
    });

    it('should throw an error if the cache store does not support key listing', async () => {
      (mockCacheManager.store.keys as any) = undefined;
      await expect(service.getExchangeNames()).rejects.toThrow(
        'Cache store does not support key listing.',
      );
    });
  });

  describe('initializeExchange', () => {
    it('should initialize exchange, call initExchangeDependencies, and cache markets', async () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValue('true');

      const spyInitDeps = jest.spyOn(service, 'initExchangeDependencies');

      const exchange = await service.initializeExchange('binance', {
        name: 'binance',
        key: 'testApiKey',
        secret: 'testSecret',
      });

      expect(exchange).toBeDefined();
      expect(exchange.apiKey).toBe('testApiKey');
      expect(exchange.secret).toBe('testSecret');
      expect(exchange.loadMarkets).toHaveBeenCalled();
      expect(exchange.setSandboxMode).toHaveBeenCalledWith(true);
      expect(exchange.markets).toEqual({ someMarket: 'data' });
      expect(spyInitDeps).toHaveBeenCalledWith('binance', exchange);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `ccxt-binance-dependencies`,
        JSON.stringify(exchange.markets),
      );
    });

    it('should throw an error for a non-existing exchange', async () => {
      await expect(
        service.initializeExchange('nonexistent', {
          name: 'nonexistent',
          key: 'testApiKey',
          secret: 'testSecret',
        }),
      ).rejects.toThrow('Exchange class for nonexistent not found');
    });

    it('should handle errors, remove the exchange from cache, and throw an error', async () => {
      const error = new Error('Initialization error');
      jest.spyOn(ccxt, 'binance').mockImplementationOnce(() => {
        throw error;
      });
      (mockCacheManager.get as jest.Mock).mockResolvedValue('someData');

      await expect(
        service.initializeExchange('binance', {
          name: 'binance',
          key: 'testApiKey',
          secret: 'testSecret',
        }),
      ).rejects.toThrow('Initialization error');

      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'ccxt-binance-dependencies',
      );
    });
  });
});
