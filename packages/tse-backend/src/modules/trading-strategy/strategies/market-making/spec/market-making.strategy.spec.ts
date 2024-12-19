import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { MarketMakingStrategy } from '../market-making.strategy';
import { ExchangeRegistryService } from '../../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../../exchange-trade/exchange-trade.service';
import { MarketMakingService } from '../market-making.service';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyCommand,
} from '../model/market-making.dto';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';
import {
  calculateOrderDetails,
  getPriceSource,
} from '../../../../../common/utils/trading-strategy.utils';
import { TradeSideType } from '../../../../../common/enums/exchange-operation.enums';
import { PlaceOrderParams } from '../../../../../common/interfaces/trading-strategy.interfaces';
import { MarketMaking } from '../../../../../common/entities/market-making.entity';
import {
  MarketMakingCommandFixture,
  MarketMakingDataFixture,
} from './market-making.fixtures';

jest.mock('../../../../../common/utils/trading-strategy.utils', () => ({
  calculateOrderDetails: jest.fn(),
  getPriceSource: jest.fn(),
  isExchangeSupported: jest.fn().mockReturnValue(true),
  isPairSupported: jest.fn().mockReturnValue(true),
}));

describe('MarketMakingStrategy', () => {
  let strategy: MarketMakingStrategy;
  let exchangeRegistryService: ExchangeRegistryService;
  let tradeService: ExchangeTradeService;
  let marketMakingService: MarketMakingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketMakingStrategy,
        {
          provide: ExchangeRegistryService,
          useValue: {
            getExchangeByName: jest.fn().mockReturnValue({ name: '' }),
            getSupportedExchanges: jest.fn().mockReturnValue(['exchangea']),
            getSupportedPairs: jest.fn(),
          },
        },
        {
          provide: ExchangeTradeService,
          useValue: {
            executeLimitTrade: jest.fn(),
          },
        },
        {
          provide: MarketMakingService,
          useValue: {
            createStrategy: jest.fn(),
            findLatestStrategyByUserId: jest.fn(),
            updateStrategyStatusById: jest.fn(),
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
    marketMakingService = module.get<MarketMakingService>(MarketMakingService);
  });

  describe('create', () => {
    it('should create a market making strategy', async () => {
      const command: MarketMakingStrategyCommand = MarketMakingCommandFixture;

      await strategy.create(command);

      expect(marketMakingService.createStrategy).toHaveBeenCalledWith({
        ...command,
        status: StrategyInstanceStatus.RUNNING,
      });
    });
  });

  describe('pause', () => {
    it('should pause the strategy and clear the interval', async () => {
      const command: MarketMakingStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };

      const strategyData: MarketMaking = MarketMakingDataFixture;

      jest
        .spyOn(marketMakingService, 'findLatestStrategyByUserId')
        .mockResolvedValue(strategyData);

      await strategy.pause(command);

      expect(marketMakingService.updateStrategyStatusById).toHaveBeenCalledWith(
        1,
        StrategyInstanceStatus.PAUSED,
      );
    });

    it('should throw NotFoundException if strategy not found', async () => {
      const command: MarketMakingStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };

      jest
        .spyOn(marketMakingService, 'findLatestStrategyByUserId')
        .mockResolvedValue(null);

      await expect(strategy.pause(command)).rejects.toThrow(NotFoundException);
    });
  });

  describe('stop', () => {
    it('should stop the strategy, cancel active orders, and update the status', async () => {
      const command: MarketMakingStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };

      const strategyData: MarketMaking = MarketMakingDataFixture;

      jest
        .spyOn(marketMakingService, 'findLatestStrategyByUserId')
        .mockResolvedValue(strategyData);
      jest.spyOn(strategy, 'cancelUnfilledOrders').mockResolvedValue(0);

      await strategy.stop(command);

      expect(marketMakingService.updateStrategyStatusById).toHaveBeenCalledWith(
        1,
        StrategyInstanceStatus.STOPPED,
      );
      expect(strategy.cancelUnfilledOrders).toHaveBeenCalled();
    });

    it('should throw NotFoundException if strategy not found', async () => {
      const command: MarketMakingStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };

      jest
        .spyOn(marketMakingService, 'findLatestStrategyByUserId')
        .mockResolvedValue(null);

      await expect(strategy.stop(command)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a stopped strategy and update the status', async () => {
      const command: MarketMakingStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };

      const strategyData: MarketMaking = MarketMakingDataFixture;

      jest
        .spyOn(marketMakingService, 'findLatestStrategyByUserId')
        .mockResolvedValue(strategyData);

      const exchange = {
        fetchOpenOrders: jest.fn().mockReturnValue([]),
      };
      jest
        .spyOn(exchangeRegistryService, 'getExchangeByName')
        .mockReturnValue(exchange as any);
      await strategy.delete(command);

      expect(marketMakingService.updateStrategyStatusById).toHaveBeenCalledWith(
        1,
        StrategyInstanceStatus.DELETED,
      );
    });

    describe('evaluateMarketMaking', () => {
      it('should place buy and sell orders based on market conditions', async () => {
        const command: MarketMakingStrategyCommand = MarketMakingCommandFixture;

        const exchange = {
          fetchOpenOrders: jest.fn().mockReturnValue([]),
          amountToPrecision: jest.fn().mockReturnValue('1'),
          priceToPrecision: jest
            .fn()
            .mockImplementation((pair: string, price: number) =>
              price.toFixed(2),
            ),
        };

        jest
          .spyOn(exchangeRegistryService, 'getExchangeByName')
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
          .mockImplementation(async () => {});

        await strategy['evaluateMarketMaking'](command);

        expect(placeOrderSpy).toHaveBeenCalledTimes(2);

        expect(placeOrderSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'user1',
            clientId: 'client1',
            exchangeName: 'exchangea',
            pair: 'ETH/USDT',
            side: TradeSideType.BUY,
            amount: 1,
            price: 49000,
          }),
        );

        expect(placeOrderSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'user1',
            clientId: 'client1',
            exchangeName: 'exchangea',
            pair: 'ETH/USDT',
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
          exchangeName: 'exchangea',
          pair: 'ETH/USDT',
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
});
