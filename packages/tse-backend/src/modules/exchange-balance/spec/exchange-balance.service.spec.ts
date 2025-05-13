import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ExchangeBalanceService } from '../exchange-balance.service';
import { ExchangeDepositService } from '../../exchange-deposit/exchange-deposit.service';
import { Decimal } from 'decimal.js';
import { ExchangeBalanceCommand } from '../model/exchange-balance.model';
import { ExchangeDepositData, Transaction } from '../../../common/interfaces/exchange-data.interfaces';

describe('ExchangeBalanceService', () => {
  let service: ExchangeBalanceService;
  let exchangeDepositService: jest.Mocked<ExchangeDepositService>;
  let cacheManager: { get: jest.Mock };

  beforeEach(async () => {
    exchangeDepositService = {
      getPersistedUserSuccessfullyDepositData: jest.fn(),
      fetchDeposits: jest.fn(),
      persistInDatabaseUserSuccessfullyDeposit: jest.fn(),
    } as any;

    cacheManager = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeBalanceService,
        { provide: ExchangeDepositService, useValue: exchangeDepositService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<ExchangeBalanceService>(ExchangeBalanceService);
  });

  it('should return sum of deposits', async () => {
    cacheManager.get.mockResolvedValue(true);

    const command: ExchangeBalanceCommand = {
      userId: 'user1',
      exchangeName: 'binance',
      symbol: 'ETH',
      network: 'ERC20',
    };

    const lastDeposits: ExchangeDepositData[] = [
      {
        userId: 'user1',
        exchangeName: 'binance',
        symbol: 'ETH',
        network: 'ERC20',
        txId: 'tx1',
        txTimestamp: '2023-01-01T00:00:00Z',
        amount: new Decimal(1.5),
      },
    ];

    const fetchedDeposits: Transaction[] = [
      {
        id: 'tx2',
        txid: '0xtx2',
        type: 'deposit',
        amount: 0.5,
        currency: 'ETH',
        status: 'ok',
        timestamp: 123456789,
        datetime: '2023-01-01T01:00:00Z',
        address: '0xabc',
        info: {},
      },
    ];

    exchangeDepositService.getPersistedUserSuccessfullyDepositData.mockResolvedValue(lastDeposits);
    exchangeDepositService.fetchDeposits.mockResolvedValue(fetchedDeposits);
    exchangeDepositService.persistInDatabaseUserSuccessfullyDeposit.mockResolvedValue(undefined);

    const result = await service.getExchangeBalance(command);

    expect(result).toEqual({ balance: 2.0 });
    expect(exchangeDepositService.persistInDatabaseUserSuccessfullyDeposit).toHaveBeenCalledWith(fetchedDeposits);
  });
});
