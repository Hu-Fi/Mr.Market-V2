import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRegistryService } from './exchange-registry.service';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../logger/logger.service';
import { CcxtGateway } from '../../integrations/ccxt.gateway';

describe('ExchangeRegistryService', () => {
  let service: ExchangeRegistryService;
  let configService: ConfigService;
  let ccxtGateway: CcxtGateway;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      EXCHANGE_BINANCE_API: 'test_binance_api_key',
      EXCHANGE_BINANCE_SECRET: 'test_binance_secret',
      EXCHANGE_OKX_API: 'test_okx_api_key',
      EXCHANGE_OKX_SECRET: 'test_okx_secret',
    };

    const mockConfigService = {
      get: jest.fn((key: string) => process.env[key]),
    };

    const mockCcxtGateway = {
      exchanges: new Map(),
      addExchange: jest.fn((name: string, exchange: any) => {
        mockCcxtGateway.exchanges.set(name, exchange);
      }),
      getExchange: jest.fn((name: string) =>
        mockCcxtGateway.exchanges.get(name),
      ),
      getExchangesNames: jest.fn(() => mockCcxtGateway.exchanges.keys()),
      initializeExchange: jest.fn(
        async (name: string, apiKey: string, secret: string) => {
          if (!apiKey || !secret) {
            return null;
          }
          return { name, apiKey, secret };
        },
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRegistryService,
        ConfigService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CcxtGateway, useValue: mockCcxtGateway },
        CustomLogger,
      ],
    }).compile();

    service = module.get<ExchangeRegistryService>(ExchangeRegistryService);
    configService = module.get<ConfigService>(ConfigService);
    ccxtGateway = module.get<CcxtGateway>(CcxtGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should warn if API key or secret is missing', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'EXCHANGE_OKX_API') return null;
      return process.env[key];
    });

    await service.initializeExchanges();
    expect(service.getSupportedExchanges()).toEqual(['binance']);
    expect(service.getSupportedExchanges()).not.toContain('okx');
  });

  it('should initialize exchanges successfully', async () => {
    await service.initializeExchanges();
    expect(ccxtGateway.initializeExchange).toHaveBeenCalledWith(
      'binance',
      'test_binance_api_key',
      'test_binance_secret',
    );
    expect(ccxtGateway.initializeExchange).toHaveBeenCalledWith(
      'okx',
      'test_okx_api_key',
      'test_okx_secret',
    );
    expect(service.getSupportedExchanges()).toEqual(['binance', 'okx']);
  });

  it('should get an exchange by name', async () => {
    await service.initializeExchanges();
    const binanceExchange = service.getExchange('binance');
    expect(binanceExchange).toEqual({
      name: 'binance',
      apiKey: 'test_binance_api_key',
      secret: 'test_binance_secret',
    });
  });
});
