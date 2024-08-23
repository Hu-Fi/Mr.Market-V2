import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionWorkerService } from './execution-worker.service';
import { ArbitrageService } from '../trading-strategy/strategies/arbitrage/arbitrage.service';
import { ArbitrageStrategy } from '../trading-strategy/strategies/arbitrage/arbitrage.strategy';
import { MarketMakingService } from '../trading-strategy/strategies/market-making/market-making.service';
import { MarketMakingStrategy } from '../trading-strategy/strategies/market-making/market-making.strategy';
import { Arbitrage } from '../../common/entities/arbitrage.entity';
import { AmountChangeType, PriceSourceType, StrategyInstanceStatus } from '../../common/enums/strategy-type.enums';
import { MarketMaking } from '../../common/entities/market-making.entity';

describe('ExecutionWorkerService', () => {
  let service: ExecutionWorkerService;
  let arbitrageService: ArbitrageService;
  let arbitrageStrategy: ArbitrageStrategy;
  let marketMakingService: MarketMakingService;
  let marketMakingStrategy: MarketMakingStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutionWorkerService,
        {
          provide: ArbitrageService,
          useValue: { findRunningStrategies: jest.fn() },
        },
        {
          provide: ArbitrageStrategy,
          useValue: { start: jest.fn() },
        },
        {
          provide: MarketMakingService,
          useValue: { findRunningStrategies: jest.fn() },
        },
        {
          provide: MarketMakingStrategy,
          useValue: { start: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ExecutionWorkerService>(ExecutionWorkerService);
    arbitrageService = module.get<ArbitrageService>(ArbitrageService);
    arbitrageStrategy = module.get<ArbitrageStrategy>(ArbitrageStrategy);
    marketMakingService = module.get<MarketMakingService>(MarketMakingService);
    marketMakingStrategy = module.get<MarketMakingStrategy>(MarketMakingStrategy);
  });

  describe('handleCron', () => {
    it('should execute the strategies correctly', async () => {
      const mockArbitrageStrategies: Arbitrage[] = [
        {
          id: 1,
          userId: 'user1',
          clientId: 'client1',
          pair: 'BTC/USD',
          amountToTrade: 1000.00,
          minProfitability: 0.05,
          exchangeAName: 'ExchangeA',
          exchangeBName: 'ExchangeB',
          checkIntervalSeconds: 60,
          maxOpenOrders: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StrategyInstanceStatus.CREATED,
        },
        {
          id: 2,
          userId: 'user2',
          clientId: 'client2',
          pair: 'ETH/USD',
          amountToTrade: 500.00,
          minProfitability: 0.03,
          exchangeAName: 'ExchangeA',
          exchangeBName: 'ExchangeB',
          checkIntervalSeconds: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StrategyInstanceStatus.CREATED,
        },
      ];

      const mockMarketMakingStrategies: MarketMaking[] = [
        {
          id: 1,
          userId: 'user1',
          clientId: 'client1',
          pair: 'BTC/USD',
          exchangeName: 'ExchangeA',
          bidSpread: 0.01,
          askSpread: 0.01,
          orderAmount: 1000.00,
          checkIntervalSeconds: 60,
          numberOfLayers: 5,
          priceSourceType: PriceSourceType.MID_PRICE,
          amountChangePerLayer: 50.00,
          amountChangeType: AmountChangeType.FIXED,
          ceilingPrice: 50000.00,
          floorPrice: 30000.00,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StrategyInstanceStatus.CREATED,
        },
        {
          id: 2,
          userId: 'user2',
          clientId: 'client2',
          pair: 'ETH/USD',
          exchangeName: 'ExchangeB',
          bidSpread: 0.02,
          askSpread: 0.02,
          orderAmount: 500.00,
          checkIntervalSeconds: 120,
          numberOfLayers: 3,
          priceSourceType: PriceSourceType.LAST_PRICE,
          amountChangePerLayer: 30.00,
          amountChangeType: AmountChangeType.PERCENTAGE,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StrategyInstanceStatus.STOPPED,
        },
      ];

      jest.spyOn(arbitrageService, 'findRunningStrategies').mockResolvedValue(mockArbitrageStrategies);
      jest.spyOn(arbitrageStrategy, 'start').mockResolvedValue(undefined);
      jest.spyOn(marketMakingService, 'findRunningStrategies').mockResolvedValue(mockMarketMakingStrategies);
      jest.spyOn(marketMakingStrategy, 'start').mockResolvedValue(undefined);

      await service.handleCron();

      expect(arbitrageService.findRunningStrategies).toHaveBeenCalled();
      expect(arbitrageStrategy.start).toHaveBeenCalledWith(mockArbitrageStrategies);
      expect(marketMakingService.findRunningStrategies).toHaveBeenCalled();
      expect(marketMakingStrategy.start).toHaveBeenCalledWith(mockMarketMakingStrategies);
    });
  });
});
