import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MarketMakingStrategy } from './market-making.strategy';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import { MarketMakingStrategyCommand } from './model/market-making.dto';
import {
  calculateOrderDetails,
  getPriceSource,
} from '../../../../common/utils/trading-strategy.utils';
import { TradeSideType } from '../../../../common/enums/exchange-operation.enums';
import { PlaceOrderParams } from '../../../../common/interfaces/trading-strategy.interfaces';
import {
  AmountChangeType,
  PriceSourceType,
  StrategyTypeEnums,
} from '../../../../common/enums/strategy-type.enums';

jest.mock('../../../../common/utils/trading-strategy.utils', () => ({
  calculateOrderDetails: jest.fn(),
  getPriceSource: jest.fn(),
}));

describe('MarketMakingStrategy', () => {
  let strategy: MarketMakingStrategy;
  let exchangeRegistryService: ExchangeRegistryService;
  let tradeService: ExchangeTradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketMakingStrategy,
        {
          provide: ExchangeRegistryService,
          useValue: {
            getExchange: jest.fn().mockImplementation((name: string) => {
              return {
                amountToPrecision: jest
                  .fn()
                  .mockImplementation((amount: number) => '1.000'),
                priceToPrecision: jest
                  .fn()
                  .mockImplementation((price: number) => '49000.00'),
              } as any;
            }),
          },
        },
        {
          provide: ExchangeTradeService,
          useValue: {
            executeLimitTrade: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    strategy = module.get<MarketMakingStrategy>(MarketMakingStrategy);
    exchangeRegistryService = module.get<ExchangeRegistryService>(
      ExchangeRegistryService,
    );
    tradeService = module.get<ExchangeTradeService>(ExchangeTradeService);
  });

  describe('evaluateMarketMaking', () => {
    it('should place buy and sell orders based on market conditions', async () => {
      const command: MarketMakingStrategyCommand = {
        orderRefreshTime: 1000,
        strategyType: StrategyTypeEnums.MARKET_MAKING,
        userId: 'user1',
        clientId: 'client1',
        pair: 'BTC/USDT',
        exchangeName: 'binance',
        bidSpread: 0.1,
        askSpread: 0.1,
        orderAmount: 1,
        numberOfLayers: 1,
        priceSourceType: PriceSourceType.MID_PRICE,
        amountChangePerLayer: 0,
        amountChangeType: AmountChangeType.FIXED,
        ceilingPrice: 52000,
        floorPrice: 48000,
      };

      const exchange = {
        amountToPrecision: jest.fn().mockReturnValue('1'),
        priceToPrecision: jest
          .fn()
          .mockImplementation((pair: string, price: number) =>
            price.toFixed(2),
          ),
      };

      jest
        .spyOn(exchangeRegistryService, 'getExchange')
        .mockReturnValue(exchange as any);

      (getPriceSource as jest.Mock).mockResolvedValue(50000);
      (calculateOrderDetails as jest.Mock).mockReturnValue([
        {
          layer: 1,
          currentOrderAmount: 1,
          buyPrice: 49000,
          sellPrice: 51000,
          shouldBuy: true,
          shouldSell: true,
        },
      ]);

      const placeOrderSpy = jest
        .spyOn(strategy as any, 'placeOrder')
        .mockImplementation(async (params: PlaceOrderParams) => {});

      await strategy['evaluateMarketMaking'](command);

      expect(placeOrderSpy).toHaveBeenCalledTimes(2);

      expect(placeOrderSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          clientId: 'client1',
          exchangeName: 'binance',
          pair: 'BTC/USDT',
          side: TradeSideType.BUY,
          amount: 1,
          price: 49000,
        }),
      );

      expect(placeOrderSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          clientId: 'client1',
          exchangeName: 'binance',
          pair: 'BTC/USDT',
          side: TradeSideType.SELL,
          amount: 1,
          price: 51000,
        }),
      );
    });
  });

  describe('placeOrder', () => {
    it('should call executeLimitTrade with the correct parameters', async () => {
      const params: PlaceOrderParams = {
        userId: 'user1',
        clientId: 'client1',
        exchangeName: 'binance',
        pair: 'BTC/USDT',
        side: TradeSideType.BUY,
        amount: 1,
        price: 49000,
      };

      await strategy.placeOrder(params);

      expect(tradeService.executeLimitTrade).toHaveBeenCalledWith({
        userId: params.userId,
        clientId: params.clientId,
        exchange: params.exchangeName,
        symbol: params.pair,
        side: params.side,
        amount: params.amount,
        price: params.price,
      });
    });
  });
});
