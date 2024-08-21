import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StrategyExecutorService } from '../strategy-executor.service';
import { TradingStrategyService } from '../trading-strategy.service';
import { ExchangeRegistryService } from '../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../exchange-trade/exchange-trade.service';
import {
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyCommand,
} from '../strategies/arbitrage/model/arbitrage.dto';
import {
  createStrategyKey,
  isExchangeSupported,
} from '../../../common/utils/trading-strategy.utils';
import { ArbitrageStrategy } from '../strategies/arbitrage/arbitrage.strategy';
import { StrategyTypeEnums } from '../../../common/enums/strategy-type.enums';

jest.mock('../../../common/utils/trading-strategy.utils', () => ({
  createStrategyKey: jest.fn(),
  isExchangeSupported: jest.fn(),
}));

describe('StrategyExecutorService', () => {
  let service: StrategyExecutorService;
  let tradingStrategyService: TradingStrategyService;
  let exchangeRegistryService: ExchangeRegistryService;
  let exchangeTradeService: ExchangeTradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrategyExecutorService,
        {
          provide: TradingStrategyService,
          useValue: {
            startStrategy: jest.fn(),
            pauseStrategy: jest.fn(),
            stopStrategy: jest.fn(),
          },
        },
        {
          provide: ExchangeRegistryService,
          useValue: {
            getSupportedExchanges: jest.fn(),
          },
        },
        {
          provide: ExchangeTradeService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<StrategyExecutorService>(StrategyExecutorService);
    tradingStrategyService = module.get<TradingStrategyService>(
      TradingStrategyService,
    );
    exchangeRegistryService = module.get<ExchangeRegistryService>(
      ExchangeRegistryService,
    );
    exchangeTradeService =
      module.get<ExchangeTradeService>(ExchangeTradeService);
  });

  describe('startArbitrageStrategyForUser', () => {
    it('should throw BadRequestException if either exchange is not supported', async () => {
      const command: ArbitrageStrategyCommand = {
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
      };

      (isExchangeSupported as jest.Mock).mockReturnValueOnce(false);

      await expect(
        service.startArbitrageStrategyForUser(command),
      ).rejects.toThrow(BadRequestException);
    });

    it('should start an arbitrage strategy if exchanges are supported', async () => {
      const command: ArbitrageStrategyCommand = {
        exchangeAName: 'ExchangeA',
        exchangeBName: 'ExchangeB',
        userId: 'user1',
        clientId: 'client1',
        pair: 'ETH/USDT',
        amountToTrade: 1.0,
        minProfitability: 0.01,
      };

      (isExchangeSupported as jest.Mock)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
      const strategyKey = 'some-key';
      (createStrategyKey as jest.Mock).mockReturnValue(strategyKey);

      await service.startArbitrageStrategyForUser(command);

      expect(tradingStrategyService.startStrategy).toHaveBeenCalledWith(
        strategyKey,
        expect.any(ArbitrageStrategy),
        command,
      );
    });
  });

  describe('pauseArbitrageStrategyForUser', () => {
    it('should pause the strategy', async () => {
      const command: ArbitrageStrategyActionCommand = {
        arbitrage: StrategyTypeEnums.ARBITRAGE,
        userId: 'user1',
        clientId: 'client1',
      };

      const strategyKey = 'some-key';
      (createStrategyKey as jest.Mock).mockReturnValue(strategyKey);

      await service.pauseArbitrageStrategyForUser(command);

      expect(tradingStrategyService.pauseStrategy).toHaveBeenCalledWith(
        strategyKey,
      );
    });
  });

  describe('stopArbitrageStrategyForUser', () => {
    it('should stop the strategy', async () => {
      const command: ArbitrageStrategyActionCommand = {
        arbitrage: StrategyTypeEnums.ARBITRAGE,
        userId: 'user1',
        clientId: 'client1',
      };

      const strategyKey = 'some-key';
      (createStrategyKey as jest.Mock).mockReturnValue(strategyKey);

      await service.stopArbitrageStrategyForUser(command);

      expect(tradingStrategyService.stopStrategy).toHaveBeenCalledWith(
        strategyKey,
      );
    });
  });
});
