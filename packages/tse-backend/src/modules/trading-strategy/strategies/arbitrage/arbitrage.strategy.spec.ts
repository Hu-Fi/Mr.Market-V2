import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ArbitrageStrategy } from './arbitrage.strategy';
import { ExchangeRegistryService } from '../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../exchange-trade/exchange-trade.service';
import { ArbitrageStrategyCommand } from './model/arbitrage.dto';
import {
  calculateProfitLoss,
  calculateVWAPForAmount,
  getFee,
  isArbitrageOpportunityBuyOnA,
  isArbitrageOpportunityBuyOnB,
} from '../../../../common/utils/trading-strategy.utils';
import { ArbitrageTradeParams } from '../../../../common/interfaces/trading-strategy.interfaces';

jest.mock('../../../../common/utils/trading-strategy.utils', () => ({
  calculateVWAPForAmount: jest.fn(),
  isArbitrageOpportunityBuyOnA: jest.fn(),
  isArbitrageOpportunityBuyOnB: jest.fn(),
  getFee: jest.fn(),
  calculateProfitLoss: jest.fn(),
}));

describe('ArbitrageStrategy', () => {
  let strategy: ArbitrageStrategy;
  let exchangeRegistryService: ExchangeRegistryService;
  let tradeService: ExchangeTradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArbitrageStrategy,
        {
          provide: ExchangeRegistryService,
          useValue: {
            getExchange: jest.fn(),
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

    strategy = module.get<ArbitrageStrategy>(ArbitrageStrategy);
    exchangeRegistryService = module.get<ExchangeRegistryService>(
      ExchangeRegistryService,
    );
    tradeService = module.get<ExchangeTradeService>(ExchangeTradeService);
  });

  describe('start', () => {
    it('should start an interval to evaluate arbitrage opportunities', async () => {
      const command: ArbitrageStrategyCommand = {
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
      };

      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      await strategy.start(command);

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    });
  });

  describe('stop', () => {
    it('should clear the interval and cancel active orders', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const cancelActiveOrdersSpy = jest
        .spyOn(strategy, 'cancelActiveOrders')
        .mockResolvedValue();

      const intervalId = setInterval(() => {}, 1000);
      await strategy.stop(intervalId);

      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
      expect(cancelActiveOrdersSpy).toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should clear the interval', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const intervalId = setInterval(() => {}, 1000);
      await strategy.pause(intervalId);

      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
    });
  });

  describe('evaluateArbitrage', () => {
    it('should execute an arbitrage trade if an opportunity is found on ExchangeA', async () => {
      const command: ArbitrageStrategyCommand = {
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
      };

      const exchangeA = {
        fetchOrderBook: jest.fn().mockResolvedValue({}),
      };

      const exchangeB = {
        fetchOrderBook: jest.fn().mockResolvedValue({}),
      };

      jest
        .spyOn(exchangeRegistryService, 'getExchange')
        .mockImplementation((name: string) => {
          return name === 'ExchangeA' ? (exchangeA as any) : (exchangeB as any);
        });

      (calculateVWAPForAmount as jest.Mock)
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(105);
      (isArbitrageOpportunityBuyOnA as jest.Mock).mockReturnValue(true);

      const executeArbitrageTradeSpy = jest
        .spyOn(strategy, 'executeArbitrageTrade')
        .mockResolvedValue();

      await strategy['evaluateArbitrage'](command);

      expect(executeArbitrageTradeSpy).toHaveBeenCalledWith({
        buyExchange: exchangeA,
        sellExchange: exchangeB,
        symbol: 'ETH/USDT',
        amount: 1.0,
        userId: 'user1',
        clientId: 'client1',
        buyPrice: 100,
        sellPrice: 105,
      });
    });

    it('should not execute an arbitrage trade if no opportunity is found', async () => {
      const command: ArbitrageStrategyCommand = {
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
      };

      const exchangeA = {
        fetchOrderBook: jest.fn().mockResolvedValue({}),
      };

      const exchangeB = {
        fetchOrderBook: jest.fn().mockResolvedValue({}),
      };

      jest
        .spyOn(exchangeRegistryService, 'getExchange')
        .mockImplementation((name: string) => {
          return name === 'ExchangeA' ? (exchangeA as any) : (exchangeB as any);
        });

      (calculateVWAPForAmount as jest.Mock)
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(105);
      (isArbitrageOpportunityBuyOnA as jest.Mock).mockReturnValue(false);
      (isArbitrageOpportunityBuyOnB as jest.Mock).mockReturnValue(false);

      const executeArbitrageTradeSpy = jest
        .spyOn(strategy, 'executeArbitrageTrade')
        .mockResolvedValue();

      await strategy['evaluateArbitrage'](command);

      expect(executeArbitrageTradeSpy).not.toHaveBeenCalled();
    });
  });

  describe('executeArbitrageTrade', () => {
    it('should execute buy and sell trades and log the result', async () => {
      const params: ArbitrageTradeParams = {
        buyExchange: { id: 'ExchangeA' },
        sellExchange: { id: 'ExchangeB' },
        symbol: 'ETH/USDT',
        amount: 1.0,
        userId: 'user1',
        clientId: 'client1',
        buyPrice: 100,
        sellPrice: 105,
      };

      const buyOrder = { fee: { cost: 0.1 } };
      const sellOrder = { fee: { cost: 0.2 } };

      (tradeService.executeLimitTrade as jest.Mock)
        .mockResolvedValueOnce(buyOrder)
        .mockResolvedValueOnce(sellOrder);
      (getFee as jest.Mock).mockReturnValueOnce(0.1).mockReturnValueOnce(0.2);
      (calculateProfitLoss as jest.Mock).mockReturnValue(4.7);

      const loggerSpy = jest.spyOn(Logger.prototype, 'debug');

      await strategy.executeArbitrageTrade(params);

      expect(tradeService.executeLimitTrade).toHaveBeenCalledTimes(2);
      expect(getFee).toHaveBeenCalledTimes(2);
      expect(calculateProfitLoss).toHaveBeenCalledWith(100, 105, 1.0, 0.1, 0.2);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Arbitrage trade executed for user user1, client client1: Buy on ExchangeA at 100, sell on ExchangeB at 105, Profit/Loss: 4.7`,
      );
    });

    it('should log an error if trade execution fails', async () => {
      const params: ArbitrageTradeParams = {
        buyExchange: { id: 'ExchangeA' },
        sellExchange: { id: 'ExchangeB' },
        symbol: 'ETH/USDT',
        amount: 1.0,
        userId: 'user1',
        clientId: 'client1',
        buyPrice: 100,
        sellPrice: 105,
      };

      (tradeService.executeLimitTrade as jest.Mock).mockRejectedValue(
        new Error('Trade failed'),
      );

      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await strategy.executeArbitrageTrade(params);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Failed to execute arbitrage trade: Trade failed',
      );
    });
  });
});
