import { Test, TestingModule } from '@nestjs/testing';
import { TradingStrategyService } from './trading-strategy.service';
import { ArbitrageStrategyDto, MockArbitrageStrategy } from './strategies/mock/arbitrageStrategy.fixture';

describe('TradingStrategyService', () => {
  let service: TradingStrategyService;
  let mockArbitrageStrategy: MockArbitrageStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TradingStrategyService],
    }).compile();

    service = module.get<TradingStrategyService>(TradingStrategyService);

    const arbitrageParams = new ArbitrageStrategyDto();
    mockArbitrageStrategy = new MockArbitrageStrategy(arbitrageParams);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should start an arbitrage strategy', async () => {
    const spy = jest.spyOn(mockArbitrageStrategy, 'start');
    await service.startStrategy('arbitrage_key', mockArbitrageStrategy, {});
    expect(spy).toHaveBeenCalled();
  });

  it('should stop an arbitrage strategy', async () => {
    const spy = jest.spyOn(mockArbitrageStrategy, 'stop');
    await service.startStrategy('arbitrage_key', mockArbitrageStrategy, {});
    await service.stopStrategy('arbitrage_key');
    expect(spy).toHaveBeenCalled();
  });

  it('should pause an arbitrage strategy', async () => {
    const spy = jest.spyOn(mockArbitrageStrategy, 'pause');
    await service.startStrategy('arbitrage_key', mockArbitrageStrategy, {});
    await service.pauseStrategy('arbitrage_key');
    expect(spy).toHaveBeenCalled();
  });
});
