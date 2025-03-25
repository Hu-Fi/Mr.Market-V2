import { Test, TestingModule } from '@nestjs/testing';
import { MarketMakingService } from '../market-making.service';
import { MarketMakingRepository } from '../market-making.repository';
import { MarketMaking } from '../../../../../common/entities/market-making.entity';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';
import {
  MarketMakingDataFixture,
  MarketMakingPartialDataFixture,
} from './market-making.fixtures';

describe('MarketMakingService', () => {
  let service: MarketMakingService;
  let repository: MarketMakingRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketMakingService,
        {
          provide: MarketMakingRepository,
          useValue: {
            createStrategy: jest.fn(),
            updateStrategyStatusById: jest.fn(),
            updateStrategyPausedReasonById: jest.fn(),
            updateStrategyLastTradingAttemptById: jest.fn(),
            findRunningStrategies: jest.fn(),
            findStrategyById: jest.fn(),
            findLatestStrategyByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MarketMakingService>(MarketMakingService);
    repository = module.get<MarketMakingRepository>(MarketMakingRepository);
  });

  describe('createStrategy', () => {
    it('should create a strategy and return it', async () => {
      const strategy: Partial<MarketMaking> = MarketMakingPartialDataFixture;
      const result: MarketMaking = MarketMakingDataFixture;

      jest.spyOn(repository, 'createStrategy').mockResolvedValue(result);

      expect(await service.createStrategy(strategy)).toEqual(result);
      expect(repository.createStrategy).toHaveBeenCalledWith(strategy);
    });

    it('should throw an error if creation fails', async () => {
      const strategy: Partial<MarketMaking> = {};
      const error = new Error('Creation failed');
      jest.spyOn(repository, 'createStrategy').mockRejectedValue(error);
      await expect(service.createStrategy(strategy)).rejects.toThrow(error);
    });
  });

  describe('updateStrategyStatusById', () => {
    it('should update the strategy status by ID', async () => {
      const id = 1;
      const newState = StrategyInstanceStatus.PAUSED;

      jest
        .spyOn(repository, 'updateStrategyStatusById')
        .mockResolvedValue(undefined);

      await service.updateStrategyStatusById(id, newState);

      expect(repository.updateStrategyStatusById).toHaveBeenCalledWith(
        id,
        newState,
      );
    });

    it('should throw an error if updating the status fails', async () => {
      const id = 1;
      const newState = StrategyInstanceStatus.PAUSED;
      const error = new Error('Update failed');
      jest
        .spyOn(repository, 'updateStrategyStatusById')
        .mockRejectedValue(error);

      await expect(
        service.updateStrategyStatusById(id, newState),
      ).rejects.toThrow(error);
    });
  });

  describe('updateStrategyPausedReasonById', () => {
    it('should update paused reason by ID', async () => {
      const id = 1;
      const pausedReason = 'reason';

      jest
        .spyOn(repository, 'updateStrategyPausedReasonById')
        .mockResolvedValue(undefined);

      await service.updateStrategyPausedReasonById(id, pausedReason);

      expect(repository.updateStrategyPausedReasonById).toHaveBeenCalledWith(
        id,
        pausedReason,
      );
    });

    it('should throw an error if updating paused reason fails', async () => {
      const id = 1;
      const pausedReason = 'reason';
      const error = new Error('Update failed');

      jest
        .spyOn(repository, 'updateStrategyPausedReasonById')
        .mockRejectedValue(error);

      await expect(
        service.updateStrategyPausedReasonById(id, pausedReason),
      ).rejects.toThrow(error);
    });
  });

  describe('updateStrategyLastTradingAttemptById', () => {
    it('should update last trading attempt date by ID', async () => {
      const id = 1;
      const newDate = new Date();

      jest
        .spyOn(repository, 'updateStrategyLastTradingAttemptById')
        .mockResolvedValue(undefined);

      await service.updateStrategyLastTradingAttemptById(id, newDate);

      expect(repository.updateStrategyLastTradingAttemptById).toHaveBeenCalledWith(
        id,
        newDate,
      );
    });

    it('should throw an error if updating last trading attempt fails', async () => {
      const id = 1;
      const newDate = new Date();
      const error = new Error('Update failed');

      jest
        .spyOn(repository, 'updateStrategyLastTradingAttemptById')
        .mockRejectedValue(error);

      await expect(
        service.updateStrategyLastTradingAttemptById(id, newDate),
      ).rejects.toThrow(error);
    });
  });

  describe('findRunningStrategies', () => {
    it('should return a list of running strategies', async () => {
      const strategies: MarketMaking[] = [MarketMakingDataFixture];

      jest
        .spyOn(repository, 'findRunningStrategies')
        .mockResolvedValue(strategies);

      expect(await service.findRunningStrategies()).toEqual(strategies);
    });

    it('should throw an error if finding running strategies fails', async () => {
      const error = new Error('Find failed');

      jest.spyOn(repository, 'findRunningStrategies').mockRejectedValue(error);

      await expect(service.findRunningStrategies()).rejects.toThrow(error);
    });
  });

  describe('findStrategyById', () => {
    it('should return strategy by ID', async () => {
      const id = 1;
      const strategy: MarketMaking = MarketMakingDataFixture;

      jest.spyOn(repository, 'findStrategyById').mockResolvedValue(strategy);

      expect(await service.findStrategyById(id)).toEqual(strategy);
      expect(repository.findStrategyById).toHaveBeenCalledWith(id, undefined);
    });

    it('should return null if no strategy is found', async () => {
      const id = 999;

      jest.spyOn(repository, 'findStrategyById').mockResolvedValue(null);

      expect(await service.findStrategyById(id)).toEqual(null);
    });

    it('should throw an error if find by id fails', async () => {
      const id = 1;
      const error = new Error('Find failed');

      jest.spyOn(repository, 'findStrategyById').mockRejectedValue(error);

      await expect(service.findStrategyById(id)).rejects.toThrow(error);
    });
  });
});