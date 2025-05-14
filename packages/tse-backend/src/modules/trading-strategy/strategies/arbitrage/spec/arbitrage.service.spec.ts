import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ArbitrageService } from '../arbitrage.service';
import { ArbitrageStrategyRepository } from '../arbitrage.repository';
import { StrategyArbitrage } from '../../../../../common/entities/startegy-arbitrage.entity';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';
import { ArbitrageDataFixture } from './arbitrage.fixtures';
import { Decimal } from 'decimal.js';

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
            updateStrategyLastTradingAttemptById: jest.fn(),
            updateStrategyPausedReasonById: jest.fn(),
            findRunningStrategies: jest.fn(),
            findStrategyById: jest.fn(),
            findLatestStrategyByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArbitrageService>(ArbitrageService);
    repository = module.get<ArbitrageStrategyRepository>(
      ArbitrageStrategyRepository,
    );

    jest.clearAllMocks();
  });

  describe('createStrategy', () => {
    it('should create a strategy and return it', async () => {
      const strategy: Partial<StrategyArbitrage> = {
        userId: 'user1',
        amountToTrade: new Decimal(10),
      };
      const result: StrategyArbitrage = ArbitrageDataFixture;

      jest.spyOn(repository, 'createStrategy').mockResolvedValue(result);

      expect(await service.createStrategy(strategy)).toEqual(result);
    });

    it('should throw an error if creation fails', async () => {
      const strategy: Partial<StrategyArbitrage> = {
        userId: 'user1',
        amountToTrade: new Decimal(10),
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

  describe('updateStrategyLastTradingAttemptById', () => {
    it('should update the last trading attempt date', async () => {
      const id = 2;
      const newDate = new Date();

      jest
        .spyOn(repository, 'updateStrategyLastTradingAttemptById')
        .mockResolvedValue(undefined);

      await service.updateStrategyLastTradingAttemptById(id, newDate);
      expect(
        repository.updateStrategyLastTradingAttemptById,
      ).toHaveBeenCalledWith(id, newDate);
    });

    it('should throw an error if updating the last trading attempt fails', async () => {
      const id = 2;
      const newDate = new Date();
      const error = new Error('Update failed');

      jest
        .spyOn(repository, 'updateStrategyLastTradingAttemptById')
        .mockRejectedValue(error);
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(
        service.updateStrategyLastTradingAttemptById(id, newDate),
      ).rejects.toThrow(error);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Error updating last trading attempt with ID ${id}: ${error.message}`,
      );
    });
  });

  describe('updateStrategyPausedReasonById', () => {
    it('should update the paused reason by ID', async () => {
      const id = 3;
      const newReason = 'Market fluctuations';

      jest
        .spyOn(repository, 'updateStrategyPausedReasonById')
        .mockResolvedValue(undefined);

      await service.updateStrategyPausedReasonById(id, newReason);
      expect(repository.updateStrategyPausedReasonById).toHaveBeenCalledWith(
        id,
        newReason,
      );
    });

    it('should throw an error if updating the paused reason fails', async () => {
      const id = 3;
      const newReason = 'Market fluctuations';
      const error = new Error('Update failed');

      jest
        .spyOn(repository, 'updateStrategyPausedReasonById')
        .mockRejectedValue(error);
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(
        service.updateStrategyPausedReasonById(id, newReason),
      ).rejects.toThrow(error);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Error updating strategy paused reason with ID ${id}: ${error.message}`,
      );
    });
  });

  describe('findRunningStrategies', () => {
    it('should return a list of running strategies', async () => {
      const strategies: StrategyArbitrage[] = [ArbitrageDataFixture];

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
    it('should return a strategy by ID', async () => {
      const id = 4;
      const strategy = ArbitrageDataFixture;
      const options = { relations: ['trades'] };

      jest.spyOn(repository, 'findStrategyById').mockResolvedValue(strategy);

      expect(await service.findStrategyById(id, options)).toEqual(strategy);
      expect(repository.findStrategyById).toHaveBeenCalledWith(id, options);
    });
  });
});
