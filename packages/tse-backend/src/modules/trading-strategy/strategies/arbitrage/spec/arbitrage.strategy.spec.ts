import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { ArbitrageStrategy } from '../arbitrage.strategy';
import { ExchangeRegistryService } from '../../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../../exchange-trade/exchange-trade.service';
import { ArbitrageService } from '../arbitrage.service';
import {
  calculateVWAPForAmount,
  isArbitrageOpportunityBuyOnA,
  isArbitrageOpportunityBuyOnB,
  isExchangeSupported,
  isPairSupported,
} from '../../../../../common/utils/trading-strategy.utils';
import {
  ArbitrageStrategyDto,
  ArbitrageStrategyCommand,
  ArbitrageStrategyActionCommand,
} from '../model/arbitrage.dto';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';
import { StrategyArbitrage } from '../../../../../common/entities/startegy-arbitrage.entity';
import { ExchangeDataService } from '../../../../exchange-data/exchange-data.service';
import { Decimal } from 'decimal.js';
export const ArbitrageDtoFixture: ArbitrageStrategyDto = {
  pair: 'ETH/USDT',
  amountToTrade: String(1.0),
  minProfitability: 0.01,
  exchangeAName: 'binance',
  exchangeBName: 'mexc',
  checkIntervalSeconds: 10,
  maxOpenOrders: 1,
};

export const ArbitrageDataFixture: StrategyArbitrage = {
  createdAt: undefined,
  pausedReason: '',
  updatedAt: undefined,
  id: 1,
  userId: '123',
  clientId: '456',
  sideA: 'ETH',
  sideB: 'USDT',
  amountToTrade: new Decimal(1.0),
  minProfitability: 0.01,
  exchangeAName: 'binance',
  exchangeBName: 'mexc',
  checkIntervalSeconds: 10,
  maxOpenOrders: 1,
  status: StrategyInstanceStatus.CREATED,
  lastTradingAttemptAt: new Date(),
};

jest.mock('../../../../../common/utils/trading-strategy.utils', () => ({
  isExchangeSupported: jest.fn(),
  calculateVWAPForAmount: jest.fn(),
  isArbitrageOpportunityBuyOnA: jest.fn(),
  isArbitrageOpportunityBuyOnB: jest.fn(),
  isPairSupported: jest.fn(),
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
            getExchangeByName: jest.fn().mockReturnValue({ name: '' }),
            getSupportedExchanges: jest
              .fn()
              .mockReturnValue(['ExchangeA', 'ExchangeB']),
          },
        },
        {
          provide: ExchangeTradeService,
          useValue: {
            executeLimitTrade: jest.fn(),
            cancelUnfilledOrders: jest.fn(),
          },
        },
        {
          provide: ArbitrageService,
          useValue: {
            createStrategy: jest.fn(),
            updateStrategyStatusById: jest.fn(),
            findStrategyById: jest.fn(),
            updateStrategyPausedReasonById: jest.fn(),
          },
        },
        Logger,
        {
          provide: ExchangeDataService,
          useValue: {
            getSupportedPairs: jest.fn(),
          },
        },
      ],
    }).compile();

    (isPairSupported as jest.Mock).mockReturnValue(true);

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

      const dto: ArbitrageStrategyDto = ArbitrageDtoFixture;
      const command: ArbitrageStrategyCommand = {
        ...ArbitrageDtoFixture,
        amountToTrade: new Decimal(dto.amountToTrade),
        userId: '123',
        clientId: '456',
        sideA: 'ETH',
        sideB: 'USDT',
      };

      await strategy.create(command);

      const expectedCommand: ArbitrageStrategyCommand = {
        userId: '123',
        clientId: '456',
        sideA: 'ETH',
        sideB: 'USDT',
        amountToTrade: new Decimal(dto.amountToTrade),
        minProfitability: dto.minProfitability,
        exchangeAName: dto.exchangeAName,
        exchangeBName: dto.exchangeBName,
        checkIntervalSeconds: dto.checkIntervalSeconds,
        maxOpenOrders: dto.maxOpenOrders,
      };

      expect(arbitrageService.createStrategy).toHaveBeenCalledWith(
        expect.objectContaining(expectedCommand),
      );
    });

    it('should throw NotFoundException if an exchange is not supported', async () => {
      const dto: ArbitrageStrategyDto = ArbitrageDtoFixture;
      (isExchangeSupported as jest.Mock).mockReturnValue(false);
      const command = dto as unknown as ArbitrageStrategyCommand;

      await expect(strategy.create(command)).rejects.toThrow(NotFoundException);
    });
  });

  describe('pause', () => {
    it('should throw NotFoundException if strategy not found', async () => {
      const actionCommand: ArbitrageStrategyActionCommand = {
        id: 1,
        userId: 'user1',
        clientId: 'client1',
      };

      jest.spyOn(arbitrageService, 'findStrategyById').mockResolvedValue(null);

      await expect(strategy.pause(actionCommand)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('stop', () => {
    it('should stop the strategy, clear interval, and cancel active orders', async () => {
      const actionCommand: ArbitrageStrategyActionCommand = {
        id: 1,
        userId: 'user1',
        clientId: 'client1',
      };

      jest
        .spyOn(arbitrageService, 'findStrategyById')
        .mockResolvedValue(ArbitrageDataFixture);
      jest.spyOn(tradeService, 'cancelUnfilledOrders').mockResolvedValue(0);

      await strategy.stop(actionCommand);

      expect(arbitrageService.updateStrategyStatusById).toHaveBeenCalledWith(
        1,
        StrategyInstanceStatus.STOPPED,
      );
      expect(tradeService.cancelUnfilledOrders).toHaveBeenCalled();
    });

    it('should throw NotFoundException if strategy not found', async () => {
      const actionCommand: ArbitrageStrategyActionCommand = {
        id: 1,
        userId: 'user1',
        clientId: 'client1',
      };

      jest.spyOn(arbitrageService, 'findStrategyById').mockResolvedValue(null);

      await expect(strategy.stop(actionCommand)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a strategy', async () => {
      const actionCommand: ArbitrageStrategyActionCommand = {
        id: 1,
        userId: 'user1',
        clientId: 'client1',
      };

      jest
        .spyOn(arbitrageService, 'findStrategyById')
        .mockResolvedValue(ArbitrageDataFixture);

      const exchange = {
        fetchOpenOrders: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(exchangeRegistryService, 'getExchangeByName')
        .mockReturnValue(exchange as any);

      await strategy.delete(actionCommand);

      expect(arbitrageService.updateStrategyStatusById).toHaveBeenCalledWith(
        1,
        StrategyInstanceStatus.DELETED,
      );
    });
  });

  describe('evaluateArbitrage', () => {
    it('should execute an arbitrage trade if an opportunity is found on ExchangeA', async () => {
      const dto: ArbitrageStrategyDto = ArbitrageDtoFixture;

      const exchangeA = {
        fetchOrderBook: jest.fn().mockResolvedValue({ bids: [], asks: [] }),
      };

      const exchangeB = {
        fetchOrderBook: jest.fn().mockResolvedValue({ bids: [], asks: [] }),
      };

      jest
        .spyOn(exchangeRegistryService, 'getExchangeByName')
        .mockImplementation(
          (name: { exchangeName: string; strategy?: any; userId?: string }) => {
            return name.exchangeName === 'ExchangeA'
              ? (exchangeA as any)
              : (exchangeB as any);
          },
        );

      (calculateVWAPForAmount as jest.Mock).mockReturnValueOnce(2000);
      (isArbitrageOpportunityBuyOnA as jest.Mock).mockReturnValueOnce(true);
      const command = dto as unknown as ArbitrageStrategyCommand;

      await strategy.evaluateArbitrage(command);
      expect(tradeService.executeLimitTrade).toHaveBeenCalledTimes(2);
    });

    it('should not execute an arbitrage trade if no opportunity is found', async () => {
      const dto: ArbitrageStrategyDto = ArbitrageDtoFixture;

      const exchangeA = {
        fetchOrderBook: jest.fn().mockResolvedValue({ bids: [], asks: [] }),
      };

      const exchangeB = {
        fetchOrderBook: jest.fn().mockResolvedValue({ bids: [], asks: [] }),
      };

      jest
        .spyOn(exchangeRegistryService, 'getExchangeByName')
        .mockImplementation(
          (name: { exchangeName: string; strategy?: any; userId?: string }) => {
            return name.exchangeName === 'binance'
              ? (exchangeA as any)
              : (exchangeB as any);
          },
        );

      (calculateVWAPForAmount as jest.Mock).mockReturnValueOnce(2000);
      (isArbitrageOpportunityBuyOnA as jest.Mock).mockReturnValueOnce(false);
      (isArbitrageOpportunityBuyOnB as jest.Mock).mockReturnValueOnce(false);
      const command = dto as unknown as ArbitrageStrategyCommand;

      await strategy.evaluateArbitrage(command);

      expect(tradeService.executeLimitTrade).not.toHaveBeenCalled();
    });
  });
});
