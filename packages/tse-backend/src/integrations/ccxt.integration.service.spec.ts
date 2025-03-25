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
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  store: {
    keys: jest.fn(),
  },
} as any;

jest.mock('ccxt', () => {
  const mockBinance = jest.fn().mockImplementation(({ apiKey, secret }) => ({
    apiKey,
    secret,
    loadMarkets: jest.fn().mockResolvedValue(true),
    setSandboxMode: jest.fn(),
    has: { sandbox: true },
  }));

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

  describe('addExchange', () => {
    it('should call cacheManager.set with the correct parameters', async () => {
      await service.addExchange('binance', 'marketsData');
      expect(mockCacheManager.set).toHaveBeenCalledWith('binance', 'marketsData');
    });
  });

  describe('getDefaultExchange', () => {
    it('should return the value from cacheManager.get using key `${exchangeName}-true`', async () => {
      (mockCacheManager.get as jest.Mock).mockResolvedValue('defaultExchangeData');
      const result = await service.getDefaultExchange('binance');
      expect(mockCacheManager.get).toHaveBeenCalledWith('binance-true');
      expect(result).toEqual('defaultExchangeData');
    });
  });

  describe('getExchangeNames', () => {
    it('should return a set of exchange names from cache keys ending with "-true"', async () => {
      (mockCacheManager.store.keys as jest.Mock).mockResolvedValue(['binance-true', 'kraken-true', 'other-false']);
      const names = await service.getExchangeNames();
      expect(names).toEqual(new Set(['binance', 'kraken']));
    });

    it('should throw an error if the cache store does not support key listing', async () => {
      (mockCacheManager.store.keys as any) = undefined;
      await expect(service.getExchangeNames()).rejects.toThrow('Cache store does not support key listing.');
    });
  });

  describe('initializeExchange', () => {
    it('should initialize and return the exchange instance', async () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValue('true');

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
    });

    it('should throw an error for a non-existing exchange', async () => {
      await expect(
        service.initializeExchange('nonexistent', {
          name: 'nonexistent',
          key: 'testApiKey',
          secret: 'testSecret',
        })
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
        })
      ).rejects.toThrow("Initialization error");

      expect(mockCacheManager.del).toHaveBeenCalledWith('binance');
    });
  });
});
