import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from 'decimal.js';
import { TransactionType, TransactionStatus } from '../../../common/enums/exchange-data.enums';
import { ExchangeBalanceService } from '../exchange-balance.service';
import { BalanceStrategy } from '../../../common/interfaces/exchange-data.interfaces';
import { ExchangeBalanceCommand } from '../model/exchange-balance.model';

describe('ExchangeBalanceService', () => {
  let service: ExchangeBalanceService;

  const command: ExchangeBalanceCommand = {
    exchangeName: 'Binance',
    symbol: '',
    network: 'ETH',
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

  it('should calculate correct balances per symbol and ignore non-OK fetched transactions', async () => {
    (mockDepositStrategy.getPersisted as jest.Mock).mockResolvedValue([
      {
        amount: new Decimal(1),
        txTimestamp: '2024-01-01T00:00:00Z',
        symbol: 'BTC',
      },
      {
        amount: new Decimal(5),
        txTimestamp: '2024-01-02T00:00:00Z',
        symbol: 'ETH',
      },
    ]);
    (mockDepositStrategy.fetchAndPersist as jest.Mock).mockImplementation(
      async (cmd: ExchangeBalanceCommand) => {
        if (cmd.symbol === 'BTC') {
          return [
            { amount: 2, symbol: 'BTC', status: TransactionStatus.OK },
            { amount: 10, symbol: 'BTC', status: TransactionStatus.PENDING },
          ];
        }
        if (cmd.symbol === 'ETH') {
          return [
            { amount: 3, symbol: 'ETH', status: TransactionStatus.OK },
            { amount: 7, symbol: 'ETH', status: TransactionStatus.PENDING },
          ];
        }
        return [];
      },
    );

    (mockWithdrawalStrategy.getPersisted as jest.Mock).mockResolvedValue([
      {
        amount: new Decimal(0.5),
        txTimestamp: '2024-01-01T00:00:00Z',
        symbol: 'BTC',
      },
      {
        amount: new Decimal(2),
        txTimestamp: '2024-01-02T00:00:00Z',
        symbol: 'ETH',
      },
    ]);
    (mockWithdrawalStrategy.fetchAndPersist as jest.Mock).mockImplementation(
      async (cmd: ExchangeBalanceCommand) => {
        if (cmd.symbol === 'BTC') {
          return [
            { amount: 0.5, symbol: 'BTC', status: TransactionStatus.OK },
            { amount: 4, symbol: 'BTC', status: TransactionStatus.PENDING },
          ];
        }
        if (cmd.symbol === 'ETH') {
          return [
            { amount: 1, symbol: 'ETH', status: TransactionStatus.OK },
            { amount: 6, symbol: 'ETH', status: TransactionStatus.PENDING },
          ];
        }
        return [];
      },
    );

    const result = await service.getExchangeBalance(command);
    console.log(result);

    expect(result.balances['BTC'].depositBalance).toBe('3'); // 1 + 2 (PENDING 10 ignored)
    expect(result.balances['BTC'].withdrawalBalance).toBe('1'); // 0.5 + 0.5 (PENDING 4 ignored)
    expect(result.balances['BTC'].totalBalance).toBe('2'); // 3 - 1

    expect(result.balances['ETH'].depositBalance).toBe('8'); // 5 + 3 (PENDING 7 ignored)
    expect(result.balances['ETH'].withdrawalBalance).toBe('3'); // 2 + 1 (PENDING 6 ignored)
    expect(result.balances['ETH'].totalBalance).toBe('5'); // 8 - 3
  });
});
