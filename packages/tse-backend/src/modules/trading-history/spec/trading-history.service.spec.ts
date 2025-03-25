import { Test, TestingModule } from '@nestjs/testing';
import { TradingHistoryService } from '../trading-history.service';
import { OrderRepository } from '../../exchange-operation/order.repository';
import { Between } from 'typeorm';
import { GetUserTradingHistoryQueryCommand } from '../model/trading-history.model';
import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../../../common/enums/exchange-operation.enums';
import { MarketMakingRepository } from '../../trading-strategy/strategies/market-making/market-making.repository';
import { ArbitrageStrategyRepository } from '../../trading-strategy/strategies/arbitrage/arbitrage.repository';
import { VolumeStrategyRepository } from '../../trading-strategy/strategies/volume/volume.repository';

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
        { provide: MarketMakingRepository, useValue: {} },
        { provide: ArbitrageStrategyRepository, useValue: {} },
        { provide: VolumeStrategyRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<TradingHistoryService>(TradingHistoryService);
    repository = module.get<OrderRepository>(OrderRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserTradingHistory', () => {
    const params: string = '1';

    it('should filter trading history correctly with a full set of filters', async () => {
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

      mockOrderRepository.find.mockResolvedValue([{ id: 1 }]);

      const result = await service.getUserTradingHistory(params, queries);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          userId: params,
          createdAt: Between(new Date('2024-01-01'), new Date('2024-01-31')),
          exchangeName: 'Binance',
          symbol: 'BTC/USD',
          type: MarketOrderType.LIMIT_ORDER,
          status: OrderStatus.EXECUTED,
          side: TradeSideType.BUY,
        },
        take: 10,
        skip: 0,
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual([{ id: 1 }]);
    });

    it('should apply pagination and sorting properly', async () => {
      const queries = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: 2,
        limit: 5,
        sortBy: 'price',
        sortOrder: 'ASC',
      };

      mockOrderRepository.find.mockResolvedValue([]);

      const result = await service.getUserTradingHistory(params, queries);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          userId: params,
          createdAt: Between(new Date('2024-01-01'), new Date('2024-01-31')),
        },
        take: 5,
        skip: 5,
        order: {
          price: 'ASC',
        },
      });

      expect(result).toEqual([]);
    });

    it('should handle no results returned from the repository', async () => {
      mockOrderRepository.find.mockResolvedValue([]);

      const queries = {};

      const result = await service.getUserTradingHistory(params, queries);

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: params },
        take: 10,
        skip: 0,
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual([]);
    });

    it('should handle partial filter parameters', async () => {
      const queries = {
        exchangeName: 'Coinbase',
        type: MarketOrderType.MARKET_ORDER,
      };

      mockOrderRepository.find.mockResolvedValue([{ id: 5 }]);

      const result = await service.getUserTradingHistory(params, queries);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          userId: params,
          exchangeName: 'Coinbase',
          type: MarketOrderType.MARKET_ORDER,
        },
        take: 10,
        skip: 0,
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual([{ id: 5 }]);
    });

    it('should correctly convert string filters to enums', async () => {
      const queries = {
        status: 'executed',
        side: 'buy',
      };

      mockOrderRepository.find.mockResolvedValue([{ id: 10 }]);

      const result = await service.getUserTradingHistory(
        params,
        queries as any,
      );

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          userId: params,
          status: OrderStatus.EXECUTED,
          side: TradeSideType.BUY,
        },
        take: 10,
        skip: 0,
        order: {
          createdAt: 'DESC',
        },
      });

      expect(result).toEqual([{ id: 10 }]);
    });
  });
});
