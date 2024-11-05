import { Test, TestingModule } from '@nestjs/testing';
import * as ccxt from 'ccxt';
import { CcxtGateway } from './ccxt.gateway';
import { CustomLogger } from '../modules/logger/logger.service';
import { ConfigService } from '@nestjs/config';

jest.mock('ccxt', () => {
  const mockBinance = jest.fn().mockImplementation(({ apiKey, secret }) => ({
    apiKey,
    secret,
    loadMarkets: jest.fn().mockResolvedValue(true),
    setSandboxMode: jest.fn(),
  }));

  return {
    binance: mockBinance,
    pro: {
      binance: mockBinance,
    },
  };
});

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => process.env[key]),
};

describe('CcxtGateway', () => {
  let gateway: CcxtGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CcxtGateway,
        { provide: CustomLogger, useValue: mockLogger },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    gateway = module.get<CcxtGateway>(CcxtGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('addExchange', () => {
    it('should add an exchange to the map', () => {
      const exchange = new ccxt.binance({ apiKey: 'test', secret: 'test' });
      gateway.addExchange('binance', exchange);

      expect(gateway.getExchange('binance')).toBe(exchange);
    });
  });

  describe('getExchange', () => {
    it('should return the correct exchange instance', () => {
      const exchange = new ccxt.binance({ apiKey: 'test', secret: 'test' });
      gateway.addExchange('binance', exchange);

      const retrievedExchange = gateway.getExchange('binance');
      expect(retrievedExchange).toBe(exchange);
    });

    it('should return undefined for a non-existing exchange', () => {
      const retrievedExchange = gateway.getExchange('nonexistent');
      expect(retrievedExchange).toBeUndefined();
    });
  });

  describe('getExchangesNames', () => {
    it('should return the keys of the exchanges map', () => {
      const exchange1 = new ccxt.binance({ apiKey: 'test', secret: 'test' });
      const exchange2 = new ccxt.binance({ apiKey: 'test', secret: 'test' });
      gateway.addExchange('binance', exchange1);
      gateway.addExchange('kraken', exchange2);

      const exchangesNames = Array.from(gateway.getExchangesNames());
      expect(exchangesNames).toContain('binance');
      expect(exchangesNames).toContain('kraken');
    });
  });

  describe('initializeExchange', () => {
    it('should initialize and return the exchange instance', async () => {
      const exchange = await gateway.initializeExchange(
        'binance',
        'testApiKey',
        'testSecret',
      );
      expect(exchange).toBeDefined();
      expect(exchange.apiKey).toBe('testApiKey');
      expect(exchange.secret).toBe('testSecret');
      expect(exchange.loadMarkets).toHaveBeenCalled();
    });

    it('should throw an error for a non-existing exchange', async () => {
      await expect(
        gateway.initializeExchange('nonexistent', 'testApiKey', 'testSecret'),
      ).rejects.toThrow('Exchange class for nonexistent not found');
    });

    it('should handle errors and throw an error', async () => {
      jest.spyOn(ccxt, 'binance').mockImplementationOnce(() => {
        throw new Error('Initialization error');
      });

      await expect(
        gateway.initializeExchange('binance', 'testApiKey', 'testSecret'),
      ).rejects.toThrow('Failed to initialize binance: Initialization error');
    });
  });
});
