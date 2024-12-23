import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRegistryService } from './exchange-registry.service';
import { CustomLogger } from '../logger/logger.service';
import { CcxtGateway } from '../../integrations/ccxt.gateway';
import { ExchangeApiKeyService } from './exchange-manager/exchange-api-key.service';
import { FirstExchangeStrategy } from './exchange-manager/strategies/first-exchange.strategy';
import * as ccxt from 'ccxt';
jest.mock('../logger/logger.service');

function createExchangeInstances(
  exchangeConfigs: { id: string }[],
): ccxt.Exchange[] {
  return exchangeConfigs.map((config) => {
    if (ccxt[config.id]) {
      return new ccxt[config.id]({ apiKey: 'api-key', secret: 'secret' });
    }
    throw new Error(`Exchange ${config.id} not supported.`);
  });
}

describe('ExchangeRegistryService', () => {
  let service: ExchangeRegistryService;
  let ccxtGateway: CcxtGateway;
  let exchangeApiKeyService: ExchangeApiKeyService;

  const exchangeConfigs = [{ id: 'binance' }, { id: 'bybit' }];
  const mockExchangeInstances = createExchangeInstances(exchangeConfigs);
  const mockApiKeys = [
    { apiKey: 'mockApiKey1', apiSecret: 'mockApiSecret1' },
    { apiKey: 'mockApiKey2', apiSecret: 'mockApiSecret2' },
  ];

  beforeEach(async () => {
    jest.resetAllMocks();

    const mockCcxtGateway = {
      getExchangeInstances: jest.fn().mockReturnValue([]),
      initializeExchange: jest.fn().mockResolvedValue(mockExchangeInstances[0]),
      addExchange: jest.fn(),
      getExchangeNames: jest
        .fn()
        .mockReturnValue(new Set(['binance', 'bybit'])),
    };

    const mockExchangeApiKeyService = {
      getExchangeApiKeys: jest.fn().mockResolvedValue(mockApiKeys),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRegistryService,
        { provide: CcxtGateway, useValue: mockCcxtGateway },
        { provide: ExchangeApiKeyService, useValue: mockExchangeApiKeyService },
        CustomLogger,
      ],
    }).compile();

    service = module.get<ExchangeRegistryService>(ExchangeRegistryService);
    ccxtGateway = module.get<CcxtGateway>(CcxtGateway);
    exchangeApiKeyService = module.get<ExchangeApiKeyService>(
      ExchangeApiKeyService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExchangeByName', () => {
    it('should initialize exchanges if none exist', async () => {
      const exchangeName = 'binance';
      jest.spyOn(ccxtGateway, 'getExchangeInstances').mockReturnValue([]);
      const strategy = new FirstExchangeStrategy();

      const result = await service.getExchangeByName(exchangeName, strategy);

      expect(ccxtGateway.getExchangeInstances).toHaveBeenCalledWith(
        exchangeName,
      );
      expect(ccxtGateway.initializeExchange).toHaveBeenCalledTimes(
        mockApiKeys.length,
      );
      expect(result).toEqual(mockExchangeInstances[0]);
    });

    it('should return an existing exchange if already initialized', async () => {
      const exchangeName = 'binance';
      jest
        .spyOn(ccxtGateway, 'getExchangeInstances')
        .mockReturnValue(mockExchangeInstances);
      const strategy = new FirstExchangeStrategy();

      const result = await service.getExchangeByName(exchangeName, strategy);

      expect(ccxtGateway.getExchangeInstances).toHaveBeenCalledWith(
        exchangeName,
      );
      expect(ccxtGateway.initializeExchange).not.toHaveBeenCalled();
      expect(result).toEqual(mockExchangeInstances[0]);
    });
  });

  describe('initializeExchanges', () => {
    it('should initialize exchanges with API keys', async () => {
      const exchangeName = 'binance';

      const result = await service['initializeExchanges'](exchangeName);

      expect(exchangeApiKeyService.getExchangeApiKeys).toHaveBeenCalledWith(
        exchangeName,
      );
      expect(ccxtGateway.initializeExchange).toHaveBeenCalledTimes(
        mockApiKeys.length,
      );
      expect(ccxtGateway.addExchange).toHaveBeenCalledTimes(mockApiKeys.length);
      expect(result).toHaveLength(mockApiKeys.length);
    });
  });

  describe('getApiKeys', () => {
    it('should retrieve API keys for a given exchange', async () => {
      const exchangeName = 'binance';

      const result = await service.getApiKeys(exchangeName);

      expect(exchangeApiKeyService.getExchangeApiKeys).toHaveBeenCalledWith(
        exchangeName,
      );
      expect(result).toEqual(mockApiKeys);
    });
  });

  describe('getSupportedExchanges', () => {
    it('should return supported exchanges', () => {
      const result = service.getSupportedExchanges();

      expect(ccxtGateway.getExchangeNames).toHaveBeenCalled();
      expect(result).toEqual(['binance', 'bybit']);
    });
  });
});
