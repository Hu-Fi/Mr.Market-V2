import { Test, TestingModule } from '@nestjs/testing';
import { TradingHistoryService } from '../trading-history.service';
import { OrderRepository } from '../../exchange-operation/order.repository';
import { Between } from 'typeorm';
import {
  GetUserTradingHistoryParamsCommand,
  GetUserTradingHistoryQueryCommand,
} from '../model/trading-history.model';
import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../../../common/enums/exchange-operation.enums';

describe('TradingHistoryService', () => {
  let service: TradingHistoryService;
  let repository: OrderRepository;

  const mockOrderRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradingHistoryService,
        { provide: OrderRepository, useValue: mockOrderRepository },
      ],
    }).compile();

    service = module.get<TradingHistoryService>(TradingHistoryService);
    repository = module.get<OrderRepository>(OrderRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserTradingHistory', () => {
    const params: GetUserTradingHistoryParamsCommand = { userId: 1 };
    const queries: GetUserTradingHistoryQueryCommand = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      exchangeName: 'Binance',
      symbol: 'BTC/USD',
      type: MarketOrderType.LIMIT_ORDER,
      status: OrderStatus.EXECUTED,
      side: TradeSideType.BUY,
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    it('should call repository with correct query filters', async () => {
      mockOrderRepository.find.mockResolvedValue([{ id: 1 }]);

      const result = await service.getUserTradingHistory(params, queries);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          userId: 1,
          createdAt: Between(new Date('2024-01-01'), new Date('2024-01-31')),
          exchangeName: 'Binance',
          symbol: 'BTC/USD',
          type: 'limit',
          status: 'executed',
          side: 'buy',
        },
        take: 10,
        skip: 0,
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual([{ id: 1 }]);
    });

    it('should apply pagination and sorting', async () => {
      const paginatedQueries = {
        ...queries,
        page: 2,
        limit: 5,
        sortBy: 'price',
        sortOrder: 'ASC',
      };

      await service.getUserTradingHistory(params, paginatedQueries);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          userId: 1,
          createdAt: Between(new Date('2024-01-01'), new Date('2024-01-31')),
          exchangeName: 'Binance',
          symbol: 'BTC/USD',
          type: 'limit',
          status: 'executed',
          side: 'buy',
        },
        take: 5,
        skip: 5,
        order: {
          price: 'ASC',
        },
      });
    });
  });
});
