import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MarketMakingStrategy } from '../market-making.strategy';
import { ExchangeRegistryService } from '../../../../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../../../../exchange-trade/exchange-trade.service';
import { MarketMakingService } from '../market-making.service';
import { MarketMakingStrategyCommand } from '../model/market-making.dto';
import { StrategyInstanceStatus } from '../../../../../common/enums/strategy-type.enums';
import { MarketMakingCommandFixture } from './market-making.fixtures';
import { ExchangeDataService } from '../../../../exchange-data/exchange-data.service';
import { CcxtIntegrationService } from '../../../../../integrations/ccxt.integration.service';

jest.mock('../../../../../common/utils/trading-strategy.utils', () => ({
  calculateOrderDetails: jest.fn(),
  getPriceSource: jest.fn(),
  isExchangeSupported: jest.fn().mockReturnValue(true),
  isPairSupported: jest.fn().mockReturnValue(true),
}));

describe('MarketMakingStrategy', () => {
  let strategy: MarketMakingStrategy;
  let exchangeRegistryService: ExchangeRegistryService;
  let marketMakingService: MarketMakingService;

  const mockCcxtGateway = {
    getExchangeInstances: jest
      .fn()
      .mockResolvedValue([{ name: 'mockExchange' }]),
    interpretError: jest.fn(),
  };

  const exchangeMock = {
    fetchOpenOrders: jest.fn().mockResolvedValue([]),
    amountToPrecision: jest.fn().mockReturnValue('1'),
    priceToPrecision: jest
      .fn()
      .mockImplementation((pair: string, price: number) => price.toFixed(2)),
    fetchTicker: jest.fn().mockResolvedValue({ last: 100 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketMakingStrategy,
        {
          provide: ExchangeRegistryService,
          useValue: {
            getExchangeByName: jest.fn().mockResolvedValue(exchangeMock),
            getSupportedExchanges: jest.fn().mockResolvedValue(['exchangea']),
            getSupportedPairs: jest.fn(),
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
          provide: MarketMakingService,
          useValue: {
            createStrategy: jest.fn(),
            findLatestStrategyByUserId: jest.fn().mockResolvedValue({}),
            updateStrategyStatusById: jest.fn().mockResolvedValue({}),
          },
        },
        Logger,
        {
          provide: CcxtIntegrationService,
          useValue: mockCcxtGateway,
        },
        {
          provide: ExchangeDataService,
          useValue: { getSupportedPairs: jest.fn() },
        },
      ],
    }).compile();

    strategy = module.get<MarketMakingStrategy>(MarketMakingStrategy);
    exchangeRegistryService = module.get<ExchangeRegistryService>(
      ExchangeRegistryService,
    );
    marketMakingService = module.get<MarketMakingService>(MarketMakingService);
  });

  describe('create', () => {
    it('should correctly create market making strategy with fetched ticker price', async () => {
      const command: MarketMakingStrategyCommand = MarketMakingCommandFixture;

      await strategy.create(command);

      expect(exchangeRegistryService.getExchangeByName).toHaveBeenCalledWith(
        command.exchangeName,
      );
      expect(exchangeMock.fetchTicker).toHaveBeenCalledWith(
        `${command.sideA}/${command.sideB}`,
      );

      expect(marketMakingService.createStrategy).toHaveBeenCalledWith({
        userId: command.userId,
        clientId: command.clientId,
        sideA: command.sideA,
        sideB: command.sideB,
        exchangeName: command.exchangeName,
        oracleExchangeName: command.oracleExchangeName,
        startPrice: 100,
        bidSpread: command.bidSpread,
        askSpread: command.askSpread,
        orderAmount: command.orderAmount,
        checkIntervalSeconds: command.checkIntervalSeconds,
        numberOfLayers: command.numberOfLayers,
        priceSourceType: command.priceSourceType,
        amountChangePerLayer: command.amountChangePerLayer,
        amountChangeType: command.amountChangeType,
        ceilingPrice: command.ceilingPrice,
        floorPrice: command.floorPrice,
        status: StrategyInstanceStatus.RUNNING,
      });
    });
  });
});
