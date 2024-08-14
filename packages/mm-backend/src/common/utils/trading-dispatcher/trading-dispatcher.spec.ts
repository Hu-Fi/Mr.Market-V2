import { Test, TestingModule } from '@nestjs/testing';
import { SpotStrategy } from './spot-strategy';
import { ArbitrageStrategy } from './arbitrage-strategy';
import { MarketMakingStrategy } from './market-making-strategy';
import { SafeSnapshot } from '@mixin.dev/mixin-node-sdk';
import { StrategyExecutor } from './strategy-executor';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as MemoDecoders from '../memo-decoders';
import { TradingType } from '../../enums/memo.enum';

describe('TradingStrategyContext Integrated Test', () => {
  let context: StrategyExecutor;
  let spotStrategy: SpotStrategy;
  let arbitrageStrategy: ArbitrageStrategy;
  let marketMakingStrategy: MarketMakingStrategy;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrategyExecutor,
        SpotStrategy,
        ArbitrageStrategy,
        MarketMakingStrategy,
        EventEmitter2,
      ],
    }).compile();

    context = module.get<StrategyExecutor>(StrategyExecutor);
    spotStrategy = module.get<SpotStrategy>(SpotStrategy);
    arbitrageStrategy = module.get<ArbitrageStrategy>(ArbitrageStrategy);
    marketMakingStrategy =
      module.get<MarketMakingStrategy>(MarketMakingStrategy);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should execute correct strategy based on trading type and emit appropriate event', () => {
    const snapshot: SafeSnapshot = {
      snapshot_id: '123',
      type: 'type',
      asset_id: 'asset123',
      amount: '1000',
      user_id: 'user123',
      opponent_id: 'opponent123',
      memo: 'memo',
      transaction_hash: 'hash123',
      created_at: new Date().toISOString(),
      trace_id: null,
      confirmations: null,
      opening_balance: null,
      closing_balance: null,
      deposit: null,
      withdrawal: null,
    };

    const spotMemo = 'SP:LB:01:dest123:5000:ref123';
    const arbMemo = 'AR:CR:01:02:Z7GC:trace123';
    const mmMemo = 'MM:CR:01:Z7GC:trace123';

    const spotDetails = MemoDecoders.decodeSpotMemo(spotMemo);
    const arbDetails = MemoDecoders.decodeArbitrageMemo(arbMemo);
    const mmDetails = MemoDecoders.decodeMarketMakingMemo(mmMemo);

    jest.spyOn(spotStrategy, 'execute');
    jest.spyOn(arbitrageStrategy, 'execute');
    jest.spyOn(marketMakingStrategy, 'execute');
    jest.spyOn(eventEmitter, 'emit');

    context.executeStrategy('SP', spotMemo, snapshot);
    expect(spotStrategy.execute).toHaveBeenCalledWith(spotMemo, snapshot);
    expect(eventEmitter.emit).toHaveBeenCalledWith('spot.create', {
      ...spotDetails,
      snapshot,
    });

    context.executeStrategy('AR', arbMemo, snapshot);
    expect(arbitrageStrategy.execute).toHaveBeenCalledWith(arbMemo, snapshot);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'arbitrage.create',
      arbDetails,
      snapshot,
    );

    context.executeStrategy('MM', mmMemo, snapshot);
    expect(marketMakingStrategy.execute).toHaveBeenCalledWith(mmMemo, snapshot);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'market_making.create',
      mmDetails,
      snapshot,
    );

    expect(spotDetails.tradingType).toBe(TradingType.SP);
    expect(spotDetails.spotOrderType).toBeDefined();
    expect(spotDetails.exchangeName).toBeDefined();
    expect(spotDetails.destId).toBeDefined();
    expect(spotDetails.limitPrice).toBeDefined();
    expect(spotDetails.refId).toBeDefined();

    expect(arbDetails.tradingType).toBe(TradingType.AR);
    expect(arbDetails.action).toBeDefined();
    expect(arbDetails.exchangeAName).toBeDefined();
    expect(arbDetails.exchangeBName).toBeDefined();
    expect(arbDetails.symbol).toBeDefined();
    expect(arbDetails.traceId).toBeDefined();

    expect(mmDetails.tradingType).toBe(TradingType.MM);
    expect(mmDetails.action).toBeDefined();
    expect(mmDetails.exchangeName).toBeDefined();
    expect(mmDetails.symbol).toBeDefined();
    expect(mmDetails.traceId).toBeDefined();
  });

  it('should not execute any strategy for unknown trading type and not emit any event', () => {
    const snapshot: SafeSnapshot = {
      snapshot_id: '123',
      type: 'type',
      asset_id: 'asset123',
      amount: '1000',
      user_id: 'user123',
      opponent_id: 'opponent123',
      memo: 'memo',
      transaction_hash: 'hash123',
      created_at: new Date().toISOString(),
      trace_id: null,
      confirmations: null,
      opening_balance: null,
      closing_balance: null,
      deposit: null,
      withdrawal: null,
    };
    const unknownMemo = 'XX:UNKNOWN:UNKNOWN:UNKNOWN:UNKNOWN:UNKNOWN';

    jest.spyOn(spotStrategy, 'execute');
    jest.spyOn(arbitrageStrategy, 'execute');
    jest.spyOn(marketMakingStrategy, 'execute');
    jest.spyOn(eventEmitter, 'emit');

    context.executeStrategy('XX', unknownMemo, snapshot);

    expect(spotStrategy.execute).not.toHaveBeenCalled();
    expect(arbitrageStrategy.execute).not.toHaveBeenCalled();
    expect(marketMakingStrategy.execute).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});
