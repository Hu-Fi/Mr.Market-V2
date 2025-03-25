import { Test, TestingModule } from '@nestjs/testing';
import { TradingHistoryController } from '../trading-history.controller';
import { TradingHistoryService } from '../trading-history.service';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { TradingHistoryProfile } from '../trading-history.mapper';
import { GetUserTradingHistoryQueryDto } from '../model/trading-history.model';
import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../../../common/enums/exchange-operation.enums';

describe('TradingHistoryController', () => {
  let controller: TradingHistoryController;
  let service: TradingHistoryService;

  const mockTradingHistoryService = {
    getUserTradingHistory: jest.fn(),
    getUserStrategyHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradingHistoryController],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [TradingHistoryService, TradingHistoryProfile],
    })
      .overrideProvider(TradingHistoryService)
      .useValue(mockTradingHistoryService)
      .compile();

    controller = module.get<TradingHistoryController>(TradingHistoryController);
    service = module.get<TradingHistoryService>(TradingHistoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserTradingHistory', () => {
    const queryDto: GetUserTradingHistoryQueryDto = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      symbol: 'BTC/USD',
      type: MarketOrderType.LIMIT_ORDER,
      status: OrderStatus.EXECUTED,
      side: TradeSideType.BUY,
      page: 1,
      limit: 10,
    };

    it('should call service with userId and mapped query command', async () => {
      mockTradingHistoryService.getUserTradingHistory.mockResolvedValue([
        { id: 1 },
      ]);

      const result = await controller.getUserTradingHistory(
        queryDto,
        { user: { userId: 1 } }, // corrected here
      );

      expect(service.getUserTradingHistory).toHaveBeenCalledWith(
        1, // explicitly assert userId
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          symbol: 'BTC/USD',
          type: MarketOrderType.LIMIT_ORDER,
          status: OrderStatus.EXECUTED,
          side: TradeSideType.BUY,
          page: 1,
          limit: 10,
        }),
      );

      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getUserStrategyHistory', () => {
    it('should call service with userId and return strategies', async () => {
      const mockStrategies = [{ strategyId: 123, name: 'Strategy A' }];
      mockTradingHistoryService.getUserStrategyHistory.mockResolvedValue(
        mockStrategies,
      );

      const result = await controller.getUserStrategyHistory({
        user: { userId: 2 },
      });

      expect(service.getUserStrategyHistory).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockStrategies);
    });
  });
});
