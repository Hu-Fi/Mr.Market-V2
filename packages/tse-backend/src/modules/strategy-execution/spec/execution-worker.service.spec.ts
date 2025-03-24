import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionWorkerService } from '../execution-worker.service';
import { ArbitrageService } from '../../trading-strategy/strategies/arbitrage/arbitrage.service';
import { ArbitrageStrategy } from '../../trading-strategy/strategies/arbitrage/arbitrage.strategy';
import { MarketMakingService } from '../../trading-strategy/strategies/market-making/market-making.service';
import { MarketMakingStrategy } from '../../trading-strategy/strategies/market-making/market-making.strategy';
import { VolumeService } from '../../trading-strategy/strategies/volume/volume.service';
import { VolumeStrategy } from '../../trading-strategy/strategies/volume/volume.strategy';
import {
  arbitrageStrategiesDataFixture,
  marketMakingStrategiesDataFixture,
  volumeStrategiesDataFixture,
} from './execution-worker.fixtures';
import { Logger } from '@nestjs/common';

describe('ExecutionWorkerService', () => {
  let service: ExecutionWorkerService;

  let arbitrageService: ArbitrageService;
  let arbitrageStrategy: ArbitrageStrategy;
  let marketMakingService: MarketMakingService;
  let marketMakingStrategy: MarketMakingStrategy;
  let volumeService: VolumeService;
  let volumeStrategy: VolumeStrategy;

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
          provide: VolumeService,
          useValue: { findRunningStrategies: jest.fn() },
        },
        {
          provide: VolumeStrategy,
          useValue: { start: jest.fn() },
        },
        {
          provide: Logger,
          useValue: {
            debug: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExecutionWorkerService>(ExecutionWorkerService);

    arbitrageService = module.get<ArbitrageService>(ArbitrageService);
    arbitrageStrategy = module.get<ArbitrageStrategy>(ArbitrageStrategy);
    marketMakingService = module.get<MarketMakingService>(MarketMakingService);
    marketMakingStrategy =
      module.get<MarketMakingStrategy>(MarketMakingStrategy);
    volumeService = module.get<VolumeService>(VolumeService);
    volumeStrategy = module.get<VolumeStrategy>(VolumeStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeStrategies', () => {
    it('should execute arbitrage, market making and volume strategies successfully', async () => {
      jest
        .spyOn(arbitrageService, 'findRunningStrategies')
        .mockResolvedValue(arbitrageStrategiesDataFixture);
      jest
        .spyOn(marketMakingService, 'findRunningStrategies')
        .mockResolvedValue(marketMakingStrategiesDataFixture);
      jest
        .spyOn(volumeService, 'findRunningStrategies')
        .mockResolvedValue(volumeStrategiesDataFixture);

      await service.executeStrategies();

      expect(arbitrageService.findRunningStrategies).toHaveBeenCalled();
      expect(arbitrageStrategy.start).toHaveBeenCalledWith(
        arbitrageStrategiesDataFixture,
      );

      expect(marketMakingService.findRunningStrategies).toHaveBeenCalled();
      expect(marketMakingStrategy.start).toHaveBeenCalledWith(
        marketMakingStrategiesDataFixture,
      );

      expect(volumeService.findRunningStrategies).toHaveBeenCalled();
      expect(volumeStrategy.start).toHaveBeenCalledWith(
        volumeStrategiesDataFixture,
      );
    });

    it('should handle errors thrown by arbitrage strategy execution', async () => {
      const mockError = new Error('Mock Arbitrage Error');

      jest
        .spyOn(arbitrageService, 'findRunningStrategies')
        .mockResolvedValue(arbitrageStrategiesDataFixture);
      jest.spyOn(arbitrageStrategy, 'start').mockRejectedValue(mockError);

      await service.executeStrategies();

      expect(arbitrageStrategy.start).toHaveBeenCalledWith(
        arbitrageStrategiesDataFixture,
      );
      expect(volumeService.findRunningStrategies).toHaveBeenCalled();
      expect(marketMakingService.findRunningStrategies).toHaveBeenCalled();
    });

    it('should handle errors thrown by market making strategy execution', async () => {
      const mockError = new Error('Mock Market Making Error');

      jest
        .spyOn(marketMakingService, 'findRunningStrategies')
        .mockResolvedValue(marketMakingStrategiesDataFixture);
      jest.spyOn(marketMakingStrategy, 'start').mockRejectedValue(mockError);

      await service.executeStrategies();

      expect(marketMakingStrategy.start).toHaveBeenCalledWith(
        marketMakingStrategiesDataFixture,
      );
      expect(arbitrageService.findRunningStrategies).toHaveBeenCalled();
      expect(volumeService.findRunningStrategies).toHaveBeenCalled();
    });

    it('should handle errors thrown by volume strategy execution', async () => {
      const mockError = new Error('Mock Volume Error');

      jest
        .spyOn(volumeService, 'findRunningStrategies')
        .mockResolvedValue(volumeStrategiesDataFixture);
      jest.spyOn(volumeStrategy, 'start').mockRejectedValue(mockError);

      await service.executeStrategies();

      expect(volumeStrategy.start).toHaveBeenCalledWith(
        volumeStrategiesDataFixture,
      );
      expect(arbitrageService.findRunningStrategies).toHaveBeenCalled();
      expect(marketMakingService.findRunningStrategies).toHaveBeenCalled();
    });

    it('should log appropriate debug and error messages', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      const mockError = new Error('Mock Logging Error');
      jest
        .spyOn(arbitrageService, 'findRunningStrategies')
        .mockRejectedValue(mockError);

      await service.executeStrategies();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error executing arbitrage strategies',
        mockError.stack,
      );
    });
  });
});
