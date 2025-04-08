import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeDepositService } from '../exchange-deposit.service';
import { CcxtIntegrationService } from '../../../integrations/ccxt.integration.service';
import { CreateDepositCommand } from '../model/exchange-deposit.model';
import {
  DepositAddressCreateException,
  DepositAddressFetchException,
  ExchangeNotFoundException,
} from '../../../common/filters/deposit-address.exception.filter';
import { ExchangeRegistryService } from '../../exchange-registry/exchange-registry.service';

describe('ExchangeDepositService', () => {
  let service: ExchangeDepositService;

  const mockCcxtGateway = {
    interpretError: jest.fn(),
  };

  const mockExchangeRegistryService = {
    getExchangeByName: jest.fn(),
  };

  const createDepositCommand: CreateDepositCommand = {
    userId: '1',
    exchangeName: 'binance',
    symbol: 'ETH',
    network: 'eth',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeDepositService,
        {
          provide: CcxtIntegrationService,
          useValue: mockCcxtGateway,
        },
        {
          provide: ExchangeRegistryService,
          useValue: mockExchangeRegistryService,
        },
      ],
    }).compile();

    service = module.get<ExchangeDepositService>(ExchangeDepositService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleDeposit', () => {
    it('should throw ExchangeNotFoundException if exchange does not exist', async () => {
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(null);

      await expect(service.handleDeposit(createDepositCommand)).rejects.toThrow(
        new ExchangeNotFoundException(createDepositCommand.exchangeName),
      );
    });

    it('should throw DepositAddressFetchException if fetchDepositAddress is not supported', async () => {
      const mockExchange = { has: { fetchDepositAddress: false } };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchange,
      );

      await expect(service.handleDeposit(createDepositCommand)).rejects.toThrow(
        DepositAddressFetchException,
      );
    });

    it('should return deposit address if fetchDepositAddress is successful', async () => {
      const mockExchange = {
        has: { fetchDepositAddress: true },
        fetchDepositAddress: jest
          .fn()
          .mockResolvedValue({ address: '0xABC', tag: 'memo' }),
      };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchange,
      );

      const result = await service.handleDeposit(createDepositCommand);
      expect(result).toEqual({ address: '0xABC', memo: 'memo' });
    });

    it('should throw DepositAddressFetchException if fetchDepositAddress fails and createDepositAddress is not supported', async () => {
      const mockExchange = {
        has: { fetchDepositAddress: true, createDepositAddress: false },
        fetchDepositAddress: jest
          .fn()
          .mockRejectedValue(new Error('fetch error')),
      };
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchange,
      );
      mockCcxtGateway.interpretError.mockReturnValue(
        new DepositAddressFetchException(
          'binance',
          'ETH',
          new Error('fetch error'),
        ),
      );

      await expect(service.handleDeposit(createDepositCommand)).rejects.toThrow(
        DepositAddressFetchException,
      );
    });
  });

  describe('createDepositAddress', () => {
    it('should create a deposit address successfully', async () => {
      const mockExchange = {
        createDepositAddress: jest.fn().mockResolvedValue(true),
        fetchDepositAddress: jest
          .fn()
          .mockResolvedValue({ address: '0xGHI', tag: 'memo' }),
      };
      const symbol = 'ETH';
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchange,
      );

      const result = await service['createDepositAddress'](
        mockExchange,
        symbol,
      );
      expect(result).toEqual({ address: '0xGHI', tag: 'memo' });
      expect(mockExchange.fetchDepositAddress).toHaveBeenCalledWith(symbol);
    });

    it('should throw DepositAddressCreateException if createDepositAddress fails', async () => {
      const mockExchange = {
        id: '1',
        createDepositAddress: jest
          .fn()
          .mockRejectedValue(new Error('create error')),
      };
      const symbol = 'ETH';
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        mockExchange,
      );
      mockCcxtGateway.interpretError.mockReturnValue(
        new Error('interpreted error'),
      );

      await expect(
        service['createDepositAddress'](mockExchange, symbol),
      ).rejects.toThrow(
        new DepositAddressCreateException(
          mockExchange.id,
          symbol,
          new Error('interpreted error'),
        ),
      );
    });
  });
});
