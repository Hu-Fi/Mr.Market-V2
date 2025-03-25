import { Test, TestingModule } from '@nestjs/testing';
import { TradingHistoryController } from '../trading-history.controller';
import { TradingHistoryService } from '../trading-history.service';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { TradingHistoryProfile } from '../trading-history.mapper';
import {
  GetUserTradingHistoryQueryDto,
} from '../model/trading-history.model';
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

    it('should call service with mapped params and query', async () => {
      mockTradingHistoryService.getUserTradingHistory.mockResolvedValue([
        { id: 1 },
      ]);

      const result = await controller.getUserTradingHistory(
        queryDto,
        { user: { id: 1 } },
      );

      expect(service.getUserTradingHistory).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 1 }),
        expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          symbol: 'BTC/USD',
          type: 'limit',
          status: 'executed',
          side: 'buy',
          page: 1,
          limit: 10,
        }),
      );

      expect(result).toEqual([{ id: 1 }]);
    });
  });
});
