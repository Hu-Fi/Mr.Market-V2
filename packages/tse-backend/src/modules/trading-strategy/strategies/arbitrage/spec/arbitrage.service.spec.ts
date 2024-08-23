import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ArbitrageService } from '../arbitrage.service';
import { ArbitrageStrategyRepository } from '../arbitrage.repository';
import { Arbitrage } from '../../../../../common/entities/arbitrage.entity';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';

describe('ArbitrageService', () => {
  let service: ArbitrageService;
  let repository: ArbitrageStrategyRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArbitrageService,
        {
          provide: ArbitrageStrategyRepository,
          useValue: {
            createStrategy: jest.fn(),
            updateStrategyStatusById: jest.fn(),
            findRunningStrategies: jest.fn(),
            findLatestStrategyByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArbitrageService>(ArbitrageService);
    repository = module.get<ArbitrageStrategyRepository>(
      ArbitrageStrategyRepository,
    );
  });

  describe('createStrategy', () => {
    it('should create a strategy and return it', async () => {
      const strategy: Partial<Arbitrage> = {
        userId: 'user1',
        amountToTrade: 10,
      };
      const result: Arbitrage = {
        id: 1,
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USD',
        amountToTrade: 10,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
        checkIntervalSeconds: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StrategyInstanceStatus.RUNNING,
      };

      jest.spyOn(repository, 'createStrategy').mockResolvedValue(result);

      expect(await service.createStrategy(strategy)).toEqual(result);
    });

    it('should throw an error if creation fails', async () => {
      const strategy: Partial<Arbitrage> = {
        userId: 'user1',
        amountToTrade: 10,
      };
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
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(
        service.updateStrategyStatusById(id, newState),
      ).rejects.toThrow(error);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Error updating strategy status with ID ${id}: ${error.message}`,
      );
    });
  });

  describe('findRunningStrategies', () => {
    it('should return a list of running strategies', async () => {
      const strategies: Arbitrage[] = [
        {
          id: 1,
          userId: 'user1',
          clientId: 'client1',
          pair: 'ETH/USD',
          amountToTrade: 10,
          minProfitability: 0.01,
          exchangeAName: 'ExchangeA',
          exchangeBName: 'ExchangeB',
          checkIntervalSeconds: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: StrategyInstanceStatus.RUNNING,
        },
      ];

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
      const strategy: Arbitrage = {
        id: 1,
        userId,
        clientId: 'client1',
        pair: 'ETH/USD',
        amountToTrade: 10,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
        checkIntervalSeconds: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StrategyInstanceStatus.RUNNING,
      };

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
