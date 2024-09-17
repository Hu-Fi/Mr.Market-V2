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
            findRunningStrategies: jest.fn(),
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

  describe('findLatestStrategyByUserId', () => {
    it('should return the latest strategy for the given user ID', async () => {
      const userId = 'user1';
      const strategy: MarketMaking = MarketMakingDataFixture;

      jest
        .spyOn(repository, 'findLatestStrategyByUserId')
        .mockResolvedValue(strategy);

      expect(await service.findLatestStrategyByUserId(userId)).toEqual(
        strategy,
      );
    });

    it('should return null if no strategy is found for the given user ID', async () => {
      const userId = 'user1';

      jest
        .spyOn(repository, 'findLatestStrategyByUserId')
        .mockResolvedValue(null);

      expect(await service.findLatestStrategyByUserId(userId)).toBeNull();
    });

    it('should throw an error if finding the latest strategy fails', async () => {
      const userId = 'user1';
      const error = new Error('Find latest strategy failed');

      jest
        .spyOn(repository, 'findLatestStrategyByUserId')
        .mockRejectedValue(error);

      await expect(service.findLatestStrategyByUserId(userId)).rejects.toThrow(
        error,
      );
    });
  });
});
