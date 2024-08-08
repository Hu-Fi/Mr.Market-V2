import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeDataSubscriptionManager } from '../subscription-manager.ws.service';
import { ExchangeDataService } from '../exchange-data.service';
import { CustomLogger } from '../../logger/logger.service';
import { MarketDataType } from '../../../common/enums/exchange-data.enums';

describe('ExchangeDataSubscriptionManager', () => {
  let service: ExchangeDataSubscriptionManager;
  let exchangeDataService: ExchangeDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeDataSubscriptionManager,
        {
          provide: ExchangeDataService,
          useValue: {
            watchOrderBook: jest.fn(),
            watchTicker: jest.fn(),
            watchOHLCV: jest.fn(),
            watchTickers: jest.fn(),
          },
        },
        CustomLogger,
      ],
    }).compile();

    service = module.get<ExchangeDataSubscriptionManager>(
      ExchangeDataSubscriptionManager,
    );
    exchangeDataService = module.get<ExchangeDataService>(ExchangeDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should subscribe to OrderBook if not already subscribed', async () => {
    const spySubscribe = jest.spyOn(exchangeDataService, 'watchOrderBook');
    const callback = jest.fn();
    await service.handleSubscription(
      MarketDataType.ORDERBOOK,
      'binance',
      'BTC/USDT',
      ['BTC', 'USDT'],
      '1m',
      callback,
      undefined,
      undefined,
    );

    expect(spySubscribe).toHaveBeenCalled();
  });

  it('should not subscribe again if already subscribed', async () => {
    const spySubscribe = jest.spyOn(exchangeDataService, 'watchOrderBook');
    const callback = jest.fn();
    await service.handleSubscription(
      MarketDataType.ORDERBOOK,
      'binance',
      'BTC/USDT',
      ['BTC', 'USDT'],
      '1m',
      callback,
      undefined,
      undefined,
    );

    await service.handleSubscription(
      MarketDataType.ORDERBOOK,
      'binance',
      'BTC/USDT',
      ['BTC', 'USDT'],
      '1m',
      callback,
      undefined,
      undefined,
    );

    expect(spySubscribe).toHaveBeenCalledTimes(1);
  });

  it('should log a warning if already subscribed', async () => {
    const loggerSpy = jest.spyOn(service['logger'], 'warn');
    const callback = jest.fn();
    await service.handleSubscription(
      MarketDataType.ORDERBOOK,
      'binance',
      'BTC/USDT',
      ['BTC', 'USDT'],
      '1m',
      callback,
      undefined,
      undefined,
    );

    await service.handleSubscription(
      MarketDataType.ORDERBOOK,
      'binance',
      'BTC/USDT',
      ['BTC', 'USDT'],
      '1m',
      callback,
      undefined,
      undefined,
    );

    expect(loggerSpy).toHaveBeenCalledWith(
      'Already subscribed to OrderBook for binance:BTC/USDT',
    );
  });

  it('should log an error if subscription fails', async () => {
    jest.spyOn(exchangeDataService, 'watchOrderBook').mockImplementation(() => {
      throw new Error('Subscription error');
    });
    const loggerSpy = jest.spyOn(service['logger'], 'error');
    const callback = jest.fn();

    await expect(
      service.handleSubscription(
        MarketDataType.ORDERBOOK,
        'binance',
        'BTC/USDT',
        ['BTC', 'USDT'],
        '1m',
        callback,
        undefined,
        undefined,
      ),
    ).rejects.toThrow('Failed to subscribe to OrderBook');

    expect(loggerSpy).toHaveBeenCalledWith(
      'Error in subscribing to OrderBook: Subscription error',
    );
  });

  it('should unsubscribe correctly', () => {
    const compositeKey = 'someCompositeKey';
    service['activeSubscriptions'].set(compositeKey, true);

    service.unsubscribe(compositeKey);

    expect(service.isSubscribed(compositeKey)).toBe(false);
  });

  it('should call the correct subscription method for OHLCV', async () => {
    const spySubscribe = jest.spyOn(exchangeDataService, 'watchOHLCV');
    const callback = jest.fn();
    await service.handleSubscription(
      MarketDataType.OHLCV,
      'binance',
      'BTC/USDT',
      ['BTC', 'USDT'],
      '1m',
      callback,
      1620000000000,
      100,
    );

    expect(spySubscribe).toHaveBeenCalled();
  });

  it('should call the correct subscription method for TICKER', async () => {
    const spySubscribe = jest.spyOn(exchangeDataService, 'watchTicker');
    const callback = jest.fn();
    await service.handleSubscription(
      MarketDataType.TICKER,
      'binance',
      'BTC/USDT',
      ['BTC', 'USDT'],
      '1m',
      callback,
      undefined,
      undefined,
    );

    expect(spySubscribe).toHaveBeenCalled();
  });

  it('should call the correct subscription method for TICKERS', async () => {
    const spySubscribe = jest.spyOn(exchangeDataService, 'watchTickers');
    const callback = jest.fn();
    await service.handleSubscription(
      MarketDataType.TICKERS,
      'binance',
      '',
      ['BTC/USDT', 'ETH/USDT'],
      '1m',
      callback,
      undefined,
      undefined,
    );

    expect(spySubscribe).toHaveBeenCalled();
  });
});
