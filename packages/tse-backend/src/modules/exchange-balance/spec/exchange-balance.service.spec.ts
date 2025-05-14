import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from 'decimal.js';
import { TransactionType } from '../../../common/enums/exchange-data.enums';
import { ExchangeBalanceService } from '../exchange-balance.service';
import { BalanceStrategy } from '../../../common/interfaces/exchange-data.interfaces';
import { ExchangeBalanceCommand } from '../model/exchange-balance.model';

describe('ExchangeBalanceService', () => {
  let service: ExchangeBalanceService;

  const command: ExchangeBalanceCommand = {
    exchangeName: 'Binance',
    symbol: 'BTC',
    network: 'BTC',
    userId: 'user-1',
  };

  const mockDepositStrategy: BalanceStrategy = {
    type: TransactionType.DEPOSIT,
    getPersisted: jest.fn(),
    fetchAndPersist: jest.fn(),
  };

  const mockWithdrawalStrategy: BalanceStrategy = {
    type: TransactionType.WITHDRAWAL,
    getPersisted: jest.fn(),
    fetchAndPersist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeBalanceService,
        {
          provide: 'BALANCE_STRATEGIES',
          useValue: [mockDepositStrategy, mockWithdrawalStrategy],
        },
      ],
    }).compile();

    service = module.get<ExchangeBalanceService>(ExchangeBalanceService);
  });

  it('should calculate correct balances', async () => {
    (mockDepositStrategy.getPersisted as jest.Mock).mockResolvedValue([
      { amount: new Decimal(1), txTimestamp: '2024-01-01T00:00:00Z' },
    ]);
    (mockDepositStrategy.fetchAndPersist as jest.Mock).mockResolvedValue([
      { amount: 2 },
    ]);

    (mockWithdrawalStrategy.getPersisted as jest.Mock).mockResolvedValue([
      { amount: new Decimal(0.5), txTimestamp: '2024-01-01T00:00:00Z' },
    ]);
    (mockWithdrawalStrategy.fetchAndPersist as jest.Mock).mockResolvedValue([
      { amount: 0.5 },
    ]);

    const result = await service.getExchangeBalance(command);

    expect(result.depositBalance).toBe('3'); // 1 + 2
    expect(result.withdrawalBalance).toBe('1'); // 0.5 + 0.5
    expect(result.totalBalance).toBe('2'); // 3 - 1

    expect(mockDepositStrategy.fetchAndPersist).toHaveBeenCalledWith(
      command,
      '2024-01-01T00:00:00Z',
    );
    expect(mockWithdrawalStrategy.fetchAndPersist).toHaveBeenCalledWith(
      command,
      '2024-01-01T00:00:00Z',
    );
  });
});
