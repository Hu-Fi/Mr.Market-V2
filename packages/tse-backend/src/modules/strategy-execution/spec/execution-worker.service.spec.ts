import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionWorkerService } from '../execution-worker.service';
import { ArbitrageService } from '../../trading-strategy/strategies/arbitrage/arbitrage.service';
import { ArbitrageStrategy } from '../../trading-strategy/strategies/arbitrage/arbitrage.strategy';
import { MarketMakingService } from '../../trading-strategy/strategies/market-making/market-making.service';
import { MarketMakingStrategy } from '../../trading-strategy/strategies/market-making/market-making.strategy';
import { Arbitrage } from '../../../common/entities/arbitrage.entity';
import { MarketMaking } from '../../../common/entities/market-making.entity';
import { arbitrageStrategiesDataFixture, marketMakingStrategiesDataFixture } from './execution-worker.fixtures';
import { ConfigService } from '@nestjs/config';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { SchedulerUtil } from '../../../common/utils/scheduler.utils';

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
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue({ CRON_EXPRESSION: CronExpression.EVERY_5_SECONDS }) },
        },
        SchedulerRegistry,
        SchedulerUtil
      ],
    }).compile();

    service = module.get<ExecutionWorkerService>(ExecutionWorkerService);
    arbitrageService = module.get<ArbitrageService>(ArbitrageService);
    arbitrageStrategy = module.get<ArbitrageStrategy>(ArbitrageStrategy);
    marketMakingService = module.get<MarketMakingService>(MarketMakingService);
    marketMakingStrategy = module.get<MarketMakingStrategy>(MarketMakingStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCron', () => {
    it('should execute the strategies correctly', async () => {
      const mockArbitrageStrategies: Arbitrage[] = arbitrageStrategiesDataFixture;
      const mockMarketMakingStrategies: MarketMaking[] = marketMakingStrategiesDataFixture;

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

    it('should skip execution if a job is already running', async () => {
      service['isJobRunning'] = true;

      await service.handleCron();

      expect(arbitrageService.findRunningStrategies).not.toHaveBeenCalled();
      expect(arbitrageStrategy.start).not.toHaveBeenCalled();
      expect(marketMakingService.findRunningStrategies).not.toHaveBeenCalled();
      expect(marketMakingStrategy.start).not.toHaveBeenCalled();
    });

    it('should handle errors robustly for arbitrage and continue with market making', async () => {
      jest.spyOn(arbitrageService, 'findRunningStrategies').mockRejectedValue(new Error('Test Error'));
      jest.spyOn(marketMakingService, 'findRunningStrategies').mockResolvedValue(marketMakingStrategiesDataFixture);
      jest.spyOn(marketMakingStrategy, 'start').mockResolvedValue(undefined);

      await service.handleCron();

      expect(arbitrageStrategy.start).not.toHaveBeenCalled();
      expect(marketMakingService.findRunningStrategies).toHaveBeenCalled();
      expect(marketMakingStrategy.start).toHaveBeenCalledWith(marketMakingStrategiesDataFixture);

    });
  });
});
