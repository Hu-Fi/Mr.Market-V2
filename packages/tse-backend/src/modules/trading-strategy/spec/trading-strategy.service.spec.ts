import { Test, TestingModule } from '@nestjs/testing';
import { TradingStrategyService } from '../trading-strategy.service';
import { Strategy } from '../strategy.interface';
import { StrategyInstanceStatus } from '../../../common/enums/strategy-type.enums';
import { StrategyCommand } from '../../../common/interfaces/trading-strategy.interfaces';

describe('TradingStrategyService', () => {
  let service: TradingStrategyService;
  let strategyMock: Strategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TradingStrategyService],
    }).compile();

    service = module.get<TradingStrategyService>(TradingStrategyService);

    strategyMock = {
      start: jest.fn().mockResolvedValue(123),
      pause: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should start a new strategy if it does not exist', async () => {
    const command: StrategyCommand = {
      /* command properties */
    };

    await service.startStrategy('strategyKey1', strategyMock, command);

    expect(strategyMock.start).toHaveBeenCalledWith(command);
    expect(service['strategies'].get('strategyKey1')).toEqual({
      instance: strategyMock,
      intervalId: 123,
      status: StrategyInstanceStatus.RUNNING,
    });
  });

  it('should not start a strategy if it already exists and is running', async () => {
    service['strategies'].set('strategyKey1', {
      instance: strategyMock,
      intervalId: null,
      status: StrategyInstanceStatus.RUNNING,
    });

    const command: StrategyCommand = {
      /* command properties */
    };

    await service.startStrategy('strategyKey1', strategyMock, command);

    expect(strategyMock.start).not.toHaveBeenCalled();
  });

  it('should start a strategy if it is paused', async () => {
    service['strategies'].set('strategyKey1', {
      instance: strategyMock,
      intervalId: null,
      status: StrategyInstanceStatus.PAUSED,
    });

    const command: StrategyCommand = {
      /* command properties */
    };

    await service.startStrategy('strategyKey1', strategyMock, command);

    expect(strategyMock.start).toHaveBeenCalledWith(command);
    expect(service['strategies'].get('strategyKey1')?.status).toBe(
      StrategyInstanceStatus.RUNNING,
    );
  });

  it('should pause a running strategy', async () => {
    service['strategies'].set('strategyKey1', {
      instance: strategyMock,
      intervalId: null,
      status: StrategyInstanceStatus.RUNNING,
    });

    await service.pauseStrategy('strategyKey1');

    expect(strategyMock.pause).toHaveBeenCalledWith(null);
    expect(service['strategies'].get('strategyKey1')?.status).toBe(
      StrategyInstanceStatus.PAUSED,
    );
  });

  it('should stop a running strategy', async () => {
    service['strategies'].set('strategyKey1', {
      instance: strategyMock,
      intervalId: null,
      status: StrategyInstanceStatus.RUNNING,
    });

    await service.stopStrategy('strategyKey1');

    expect(strategyMock.stop).toHaveBeenCalledWith(null);
    expect(service['strategies'].has('strategyKey1')).toBe(false);
  });

  it('should do nothing if trying to pause a non-existent strategy', async () => {
    await service.pauseStrategy('strategyKey1');

    expect(strategyMock.pause).not.toHaveBeenCalled();
  });

  it('should do nothing if trying to stop a non-existent strategy', async () => {
    await service.stopStrategy('strategyKey1');

    expect(strategyMock.stop).not.toHaveBeenCalled();
  });
});
