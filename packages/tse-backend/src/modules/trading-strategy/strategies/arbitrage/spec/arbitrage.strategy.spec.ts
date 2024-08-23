import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException } from '@nestjs/common';
import { ArbitrageStrategy } from '../arbitrage.strategy';
import { ExchangeRegistryService } from '../../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../../exchange-trade/exchange-trade.service';
import { ArbitrageService } from '../arbitrage.service';
import {
  calculateVWAPForAmount,
  isArbitrageOpportunityBuyOnA,
  isArbitrageOpportunityBuyOnB,
  isExchangeSupported,
} from '../../../../../common/utils/trading-strategy.utils';
import {
  ArbitrageStrategyCommand,
  ArbitrageStrategyActionCommand,
} from '../model/arbitrage.dto';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';
import { Arbitrage } from '../../../../../common/entities/arbitrage.entity';

jest.mock('../../../../../common/utils/trading-strategy.utils', () => ({
  calculateVWAPForAmount: jest.fn(),
  isArbitrageOpportunityBuyOnA: jest.fn(),
  isArbitrageOpportunityBuyOnB: jest.fn(),
  getFee: jest.fn(),
  calculateProfitLoss: jest.fn(),
  isExchangeSupported: jest.fn(),
}));

describe('ArbitrageStrategy', () => {
  let strategy: ArbitrageStrategy;
  let exchangeRegistryService: ExchangeRegistryService;
  let tradeService: ExchangeTradeService;
  let arbitrageService: ArbitrageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArbitrageStrategy,
        {
          provide: ExchangeRegistryService,
          useValue: {
            getExchange: jest.fn(),
            getSupportedExchanges: jest
              .fn()
              .mockReturnValue(['ExchangeA', 'ExchangeB']),
          },
        },
        {
          provide: ExchangeTradeService,
          useValue: {
            executeLimitTrade: jest.fn(),
          },
        },
        {
          provide: ArbitrageService,
          useValue: {
            createStrategy: jest.fn(),
            findLatestStrategyByUserId: jest.fn(),
            updateStrategyStatusById: jest.fn(),
            findRunningStrategies: jest.fn(),
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
    arbitrageService = module.get<ArbitrageService>(ArbitrageService);
  });

  describe('create', () => {
    it('should create a strategy if both exchanges are supported', async () => {
      (isExchangeSupported as jest.Mock).mockReturnValue(true);

      const command: ArbitrageStrategyCommand = {
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
        checkIntervalSeconds: 5,
        maxOpenOrders: 10,
      };

      await strategy.create(command);

      expect(arbitrageService.createStrategy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          clientId: 'client1',
          pair: 'ETH/USDT',
          amountToTrade: 1.0,
          minProfitability: 0.01,
          exchangeAName: 'ExchangeA',
          exchangeBName: 'ExchangeB',
          checkIntervalSeconds: 5,
          maxOpenOrders: 10,
          status: StrategyInstanceStatus.CREATED,
        }),
      );
    });

    it('should throw BadRequestException if an exchange is not supported', async () => {
      const command: ArbitrageStrategyCommand = {
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'UnsupportedExchange',
        checkIntervalSeconds: 5,
        maxOpenOrders: 10,
      };

      (isExchangeSupported as jest.Mock).mockReturnValue(false);

      await expect(strategy.create(command)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('pause', () => {
    it('should pause the strategy and update the status', async () => {
      const command: ArbitrageStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };
      const strategyData: Arbitrage = {
        id: 1,
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
        checkIntervalSeconds: 5,
        maxOpenOrders: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StrategyInstanceStatus.RUNNING,
      };

      jest
        .spyOn(arbitrageService, 'findLatestStrategyByUserId')
        .mockResolvedValue(strategyData);

      await strategy.pause(command);

      expect(arbitrageService.updateStrategyStatusById).toHaveBeenCalledWith(
        1,
        StrategyInstanceStatus.PAUSED,
      );
    });

    it('should throw BadRequestException if strategy not found', async () => {
      const command: ArbitrageStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };

      jest
        .spyOn(arbitrageService, 'findLatestStrategyByUserId')
        .mockResolvedValue(null);

      await expect(strategy.pause(command)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('stop', () => {
    it('should stop the strategy, clear interval, and cancel active orders', async () => {
      const command: ArbitrageStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };
      const strategyData: Arbitrage = {
        id: 1,
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
        checkIntervalSeconds: 5,
        maxOpenOrders: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StrategyInstanceStatus.RUNNING,
      };

      jest
        .spyOn(arbitrageService, 'findLatestStrategyByUserId')
        .mockResolvedValue(strategyData);
      jest.spyOn(strategy, 'cancelActiveOrders').mockResolvedValue();

      await strategy.stop(command);

      expect(arbitrageService.updateStrategyStatusById).toHaveBeenCalledWith(
        1,
        StrategyInstanceStatus.STOPPED,
      );
      expect(strategy.cancelActiveOrders).toHaveBeenCalled();
    });

    it('should throw BadRequestException if strategy not found', async () => {
      const command: ArbitrageStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };

      jest
        .spyOn(arbitrageService, 'findLatestStrategyByUserId')
        .mockResolvedValue(null);

      await expect(strategy.stop(command)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a stopped strategy', async () => {
      const command: ArbitrageStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };
      const strategyData: Arbitrage = {
        id: 1,
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
        checkIntervalSeconds: 5,
        maxOpenOrders: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StrategyInstanceStatus.STOPPED,
      };

      jest
        .spyOn(arbitrageService, 'findLatestStrategyByUserId')
        .mockResolvedValue(strategyData);

      await strategy.delete(command);

      expect(arbitrageService.updateStrategyStatusById).toHaveBeenCalledWith(
        1,
        StrategyInstanceStatus.DELETED,
      );
    });

    it('should throw BadRequestException if strategy is not stopped', async () => {
      const command: ArbitrageStrategyActionCommand = {
        userId: 'user1',
        clientId: 'client1',
      };
      const strategyData: Arbitrage = {
        id: 1,
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
        checkIntervalSeconds: 5,
        maxOpenOrders: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StrategyInstanceStatus.RUNNING,
      };

      jest
        .spyOn(arbitrageService, 'findLatestStrategyByUserId')
        .mockResolvedValue(strategyData);

      await expect(strategy.delete(command)).rejects.toThrow(
        BadRequestException,
      );
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
        checkIntervalSeconds: 5,
      };

      const exchangeA = {
        fetchOrderBook: jest.fn().mockResolvedValue({ bids: [], asks: [] }),
      };

      const exchangeB = {
        fetchOrderBook: jest.fn().mockResolvedValue({ bids: [], asks: [] }),
      };

      jest
        .spyOn(exchangeRegistryService, 'getExchange')
        .mockImplementation((name: string) => {
          return name === 'ExchangeA' ? (exchangeA as any) : (exchangeB as any);
        });

      (calculateVWAPForAmount as jest.Mock).mockReturnValueOnce(2000);
      (isArbitrageOpportunityBuyOnA as jest.Mock).mockReturnValueOnce(true);

      await strategy.evaluateArbitrage(command);
      expect(tradeService.executeLimitTrade).toHaveBeenCalledTimes(2);
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
        checkIntervalSeconds: 5,
      };

      const exchangeA = {
        fetchOrderBook: jest.fn().mockResolvedValue({ bids: [], asks: [] }),
      };

      const exchangeB = {
        fetchOrderBook: jest.fn().mockResolvedValue({ bids: [], asks: [] }),
      };

      jest
        .spyOn(exchangeRegistryService, 'getExchange')
        .mockImplementation((name: string) => {
          return name === 'ExchangeA' ? (exchangeA as any) : (exchangeB as any);
        });

      (calculateVWAPForAmount as jest.Mock).mockReturnValueOnce(2000);
      (isArbitrageOpportunityBuyOnA as jest.Mock).mockReturnValueOnce(false);
      (isArbitrageOpportunityBuyOnB as jest.Mock).mockReturnValueOnce(false);

      await strategy.evaluateArbitrage(command);

      expect(tradeService.executeLimitTrade).not.toHaveBeenCalled();
    });
  });
});
