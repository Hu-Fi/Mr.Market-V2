import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeWithdrawalService } from '../exchange-withdrawal.service';
import { CcxtIntegrationService } from '../../../integrations/ccxt.integration.service';
import { CreateWithdrawalCommand } from '../model/exchange-withdrawal.model';
import {
  ExchangeNotFoundException,
  WithdrawalNotSupportedException,
} from '../../../common/filters/withdrawal.exception.filter';
import { ExchangeRegistryService } from '../../exchange-registry/exchange-registry.service';

describe('ExchangeWithdrawalService', () => {
  let service: ExchangeWithdrawalService;

  const mockExchangeRegistryService = {
    getExchangeByName: jest.fn(),
  };

  const mockCcxtGateway = {
    interpretError: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeWithdrawalService,
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

    service = module.get<ExchangeWithdrawalService>(ExchangeWithdrawalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw ExchangeNotFoundException if exchange does not exist', async () => {
    const command: CreateWithdrawalCommand = {
      userId: '',
      exchangeName: 'binance',
      symbol: 'ETH',
      network: 'eth',
      address: '0x123',
      tag: 'tag',
      amount: 1,
    };

    mockExchangeRegistryService.getExchangeByName.mockReturnValue(null);

    await expect(service.handleWithdrawal(command)).rejects.toThrow(
      ExchangeNotFoundException,
    );
    expect(mockExchangeRegistryService.getExchangeByName).toHaveBeenCalledWith(
      {"exchangeName": "binance"}
    );
  });

  it('should throw WithdrawalNotSupportedException if exchange does not support withdrawal', async () => {
    const command: CreateWithdrawalCommand = {
      userId: '',
      exchangeName: 'binance',
      symbol: 'ETH',
      network: 'eth',
      address: '0x123',
      tag: 'tag',
      amount: 1,
    };

    const mockExchange = {
      id: 'binance',
      has: { withdraw: false },
    };

    mockExchangeRegistryService.getExchangeByName.mockReturnValue(mockExchange);

    await expect(service.handleWithdrawal(command)).rejects.toThrow(
      WithdrawalNotSupportedException,
    );
    expect(mockExchangeRegistryService.getExchangeByName).toHaveBeenCalledWith(
      {"exchangeName": "binance"}
    );
  });

  it('should call withdraw method if withdrawal is supported', async () => {
    const command: CreateWithdrawalCommand = {
      userId: '',
      exchangeName: 'binance',
      symbol: 'ETH',
      network: 'eth',
      address: '0x123',
      tag: 'tag',
      amount: 1,
    };

    const mockExchange = {
      id: 'binance',
      has: { withdraw: true },
      withdraw: jest.fn().mockResolvedValue('withdrawalSuccess'),
    };

    mockExchangeRegistryService.getExchangeByName.mockReturnValue(mockExchange);

    const result = await service.handleWithdrawal(command);

    expect(mockExchange.withdraw).toHaveBeenCalledWith(
      'ETH',
      1,
      '0x123',
      'tag',
      { network: 'eth' },
    );
    expect(result).toBe('withdrawalSuccess');
  });

  it('should log and throw interpreted error on withdraw failure', async () => {
    const command: CreateWithdrawalCommand = {
      userId: '',
      exchangeName: 'binance',
      symbol: 'ETH',
      network: 'eth',
      address: '0x123',
      tag: 'tag',
      amount: 1,
    };

    const mockExchange = {
      id: 'binance',
      has: { withdraw: true },
      withdraw: jest.fn().mockRejectedValue(new Error('withdraw error')),
    };

    mockExchangeRegistryService.getExchangeByName.mockReturnValue(mockExchange);
    mockCcxtGateway.interpretError.mockReturnValue(
      new Error('interpreted error'),
    );

    await expect(service.handleWithdrawal(command)).rejects.toThrow(Error);
    expect(mockCcxtGateway.interpretError).toHaveBeenCalled();
    expect(mockExchangeRegistryService.getExchangeByName).toHaveBeenCalledWith(
      {"exchangeName": "binance"}
    );
  });
});
