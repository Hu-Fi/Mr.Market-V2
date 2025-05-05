import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeWithdrawalService } from '../exchange-withdrawal.service';
import { CcxtIntegrationService } from '../../../integrations/ccxt.integration.service';
import { CreateWithdrawalCommand } from '../model/exchange-withdrawal.model';
import {
  ExchangeNotFoundException,
  WithdrawalNotSupportedException,
} from '../../../common/filters/withdrawal.exception.filter';
import { ExchangeRegistryService } from '../../exchange-registry/exchange-registry.service';
import { Decimal } from 'decimal.js';

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
    jest.clearAllMocks();
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
      amount: new Decimal(1),
    };

    mockExchangeRegistryService.getExchangeByName.mockReturnValue(null);

    await expect(service.handleWithdrawal(command)).rejects.toThrow(
      ExchangeNotFoundException,
    );
    expect(mockExchangeRegistryService.getExchangeByName).toHaveBeenCalledWith({
      exchangeName: 'binance',
    });
  });

  it('should throw WithdrawalNotSupportedException if exchange does not support withdrawal', async () => {
    const command: CreateWithdrawalCommand = {
      userId: '',
      exchangeName: 'binance',
      symbol: 'ETH',
      network: 'eth',
      address: '0x123',
      tag: 'tag',
      amount: new Decimal(1),
    };

    const mockExchange = {
      id: 'binance',
      has: { withdraw: false },
    };

    mockExchangeRegistryService.getExchangeByName.mockReturnValue(mockExchange);

    await expect(service.handleWithdrawal(command)).rejects.toThrow(
      WithdrawalNotSupportedException,
    );
    expect(mockExchangeRegistryService.getExchangeByName).toHaveBeenCalledWith({
      exchangeName: 'binance',
    });
  });

  it('should log and throw interpreted error on withdraw failure', async () => {
    const command: CreateWithdrawalCommand = {
      userId: '',
      exchangeName: 'binance',
      symbol: 'ETH',
      network: 'eth',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      tag: 'tag',
      amount: new Decimal(1.5),
    };

    const withdrawError = new Error('withdraw error');
    const interpretedError = new Error('interpreted error');

    const mockExchange = {
      id: 'binance',
      has: { withdraw: true },
      fetchCurrencies: jest.fn().mockResolvedValue({}),
      withdraw: jest.fn().mockRejectedValue(withdrawError),
    };

    mockExchangeRegistryService.getExchangeByName.mockResolvedValue(
      mockExchange,
    );
    mockCcxtGateway.interpretError.mockReturnValueOnce(interpretedError);

    await expect(service.handleWithdrawal(command)).rejects.toThrow(
      interpretedError,
    );

    expect(mockExchange.fetchCurrencies).toHaveBeenCalled();
    expect(mockExchange.withdraw).toHaveBeenCalledWith(
      'ETH',
      command.amount,
      command.address,
      command.tag,
      { network: command.network },
    );
    expect(mockCcxtGateway.interpretError).toHaveBeenCalledWith(
      withdrawError,
      'binance',
    );
  });
});
