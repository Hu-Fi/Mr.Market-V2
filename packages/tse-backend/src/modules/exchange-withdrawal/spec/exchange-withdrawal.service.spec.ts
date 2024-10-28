import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeWithdrawalService } from '../exchange-withdrawal.service';
import { CcxtGateway } from '../../../integrations/ccxt.gateway';
import { CreateWithdrawalCommand } from '../model/exchange-withdrawal.model';
import {
  ExchangeNotFoundException,
  WithdrawalNotSupportedException,
} from '../../../common/filters/withdrawal.exception.filter';

describe('ExchangeWithdrawalService', () => {
  let service: ExchangeWithdrawalService;
  let mockCcxtGateway;

  beforeEach(async () => {
    mockCcxtGateway = {
      getExchange: jest.fn(),
      interpretError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeWithdrawalService,
        {
          provide: CcxtGateway,
          useValue: mockCcxtGateway,
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
      exchangeName: 'binance',
      symbol: 'ETH',
      network: 'eth',
      address: '0x123',
      tag: 'tag',
      amount: 1,
    };

    mockCcxtGateway.getExchange.mockReturnValue(null);

    await expect(service.handleWithdrawal(command)).rejects.toThrow(ExchangeNotFoundException);
    expect(mockCcxtGateway.getExchange).toHaveBeenCalledWith('binance');
  });

  it('should throw WithdrawalNotSupportedException if exchange does not support withdrawal', async () => {
    const command: CreateWithdrawalCommand = {
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

    mockCcxtGateway.getExchange.mockReturnValue(mockExchange);

    await expect(service.handleWithdrawal(command)).rejects.toThrow(WithdrawalNotSupportedException);
    expect(mockCcxtGateway.getExchange).toHaveBeenCalledWith('binance');
  });

  it('should call withdraw method if withdrawal is supported', async () => {
    const command: CreateWithdrawalCommand = {
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

    mockCcxtGateway.getExchange.mockReturnValue(mockExchange);

    const result = await service.handleWithdrawal(command);

    expect(mockExchange.withdraw).toHaveBeenCalledWith('ETH', 1, '0x123', 'tag', { network: 'eth' });
    expect(result).toBe('withdrawalSuccess');
  });

  it('should log and throw interpreted error on withdraw failure', async () => {
    const command: CreateWithdrawalCommand = {
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

    mockCcxtGateway.getExchange.mockReturnValue(mockExchange);
    mockCcxtGateway.interpretError.mockReturnValue(new Error('interpreted error'));

    await expect(service.handleWithdrawal(command)).rejects.toThrow(Error);
    expect(mockCcxtGateway.interpretError).toHaveBeenCalled();
    expect(mockCcxtGateway.getExchange).toHaveBeenCalledWith('binance');
  });
});
