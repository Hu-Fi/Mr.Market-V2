import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRegistryService } from './exchange-registry.service';
import { CustomLogger } from '../logger/logger.service';
import { CcxtIntegrationService } from '../../integrations/ccxt.integration.service';
import { ExchangeApiKeyService } from './exchange-manager/exchange-api-key.service';
import { GetDefaultAccountStrategy } from './exchange-manager/strategies/get-default-account.strategy';
import * as ccxt from 'ccxt';
import { EncryptionService } from '../../common/utils/encryption.service';
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
  let ccxtGateway: CcxtIntegrationService;
  let exchangeApiKeyService: ExchangeApiKeyService;

  const exchangeConfigs = [{ id: 'binance' }, { id: 'bybit' }];
  createExchangeInstances(exchangeConfigs);
  const mockApiKeys = [
    { apiKey: 'mockApiKey1', apiSecret: 'encrypted', isDefaultAccount: true },
    { apiKey: 'mockApiKey2', apiSecret: 'encrypted', isDefaultAccount: false },
  ];
  let mockEncryptionService: { decrypt: jest.Mock };

  beforeEach(async () => {
    jest.resetAllMocks();

    const mockCcxtGateway = {
      initializeExchange: jest.fn().mockImplementation((id, config) => {
        return Promise.resolve({ id, config });
      }),
      addExchange: jest.fn(),
      getExchangeNames: jest
        .fn()
        .mockResolvedValue(new Set(['binance', 'bybit'])),
    };

    const mockExchangeApiKeyService = {
      getExchangeApiKeys: jest.fn().mockResolvedValue(mockApiKeys),
    };

    mockEncryptionService = {
      decrypt: jest
        .fn()
        .mockImplementation((secret) => Promise.resolve(`decrypted-${secret}`)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRegistryService,
        { provide: CcxtIntegrationService, useValue: mockCcxtGateway },
        { provide: ExchangeApiKeyService, useValue: mockExchangeApiKeyService },
        { provide: EncryptionService, useValue: mockEncryptionService },
        CustomLogger,
        GetDefaultAccountStrategy,
      ],
    }).compile();

    service = module.get<ExchangeRegistryService>(ExchangeRegistryService);
    ccxtGateway = module.get<CcxtIntegrationService>(CcxtIntegrationService);
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
      const strategy = new GetDefaultAccountStrategy();

      const result = await service.getExchangeByName(exchangeName, strategy);

      expect(exchangeApiKeyService.getExchangeApiKeys).toHaveBeenCalledWith(
        exchangeName,
      );

      expect(mockEncryptionService.decrypt).toHaveBeenCalledWith('encrypted');

      expect(ccxtGateway.initializeExchange).toHaveBeenCalledWith(
        'binance-true',
        {
          name: 'binance',
          key: 'mockApiKey1',
          secret: 'decrypted-encrypted',
        },
      );
      expect(ccxtGateway.addExchange).toHaveBeenCalledWith(
        'binance-true',
        'loadMarkets',
      );

      expect(result).toEqual({
        id: 'binance-true',
        config: {
          name: 'binance',
          key: 'mockApiKey1',
          secret: 'decrypted-encrypted',
        },
      });
    });

    it('should return an existing exchange if already initialized', async () => {
      const exchangeName = 'binance';
      const strategy = new GetDefaultAccountStrategy();

      const existingExchange = {
        id: 'binance-true',
        config: {
          name: 'binance',
          key: 'mockApiKey1',
          secret: 'decrypted-encrypted',
        },
      } as unknown as ccxt.Exchange;

      jest
        .spyOn(ccxtGateway, 'initializeExchange')
        .mockResolvedValue(existingExchange);

      const firstResult = await service.getExchangeByName(
        exchangeName,
        strategy,
      );
      expect(firstResult).toEqual(existingExchange);

      const secondResult = await service.getExchangeByName(
        exchangeName,
        strategy,
      );
      expect(secondResult).toEqual(existingExchange);
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
      const expectedDecryptedApiKeys = [
        {
          apiKey: 'mockApiKey1',
          apiSecret: 'decrypted-encrypted',
          isDefaultAccount: true,
        },
        {
          apiKey: 'mockApiKey2',
          apiSecret: 'decrypted-encrypted',
          isDefaultAccount: false,
        },
      ];

      expect(result).toEqual(expectedDecryptedApiKeys);
    });
  });

  describe('getSupportedExchanges', () => {
    it('should return supported exchanges', async () => {
      const result = await service.getSupportedExchanges();

      expect(ccxtGateway.getExchangeNames).toHaveBeenCalled();
      expect(result).toEqual(['binance', 'bybit']);
    });
  });
});
