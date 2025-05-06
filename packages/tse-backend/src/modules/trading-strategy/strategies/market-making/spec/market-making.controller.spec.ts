import { Test, TestingModule } from '@nestjs/testing';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { MarketMakingController } from '../market-making.controller';
import { MarketMakingStrategy } from '../market-making.strategy';
import { MarketMakingStrategyProfile } from '../market-making.mapper';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyActionDto,
  MarketMakingStrategyDto,
  MarketMakingStrategyCommand,
} from '../model/market-making.dto';
import {
  AmountChangeType,
  PriceSourceType,
} from '../../../../../common/enums/strategy-type.enums';
import { Decimal } from 'decimal.js';
import { RequestWithUser } from '../../../../../common/interfaces/http-request.interfaces';

describe('MarketMakingController', () => {
  let controller: MarketMakingController;
  let service: MarketMakingStrategy;

  const reqMock = {
    user: { userId: 'user-123', clientId: 'client-456' },
  } as RequestWithUser;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [AutomapperModule.forRoot({ strategyInitializer: classes() })],
      controllers: [MarketMakingController],
      providers: [MarketMakingStrategy, MarketMakingStrategyProfile],
    })
      .overrideProvider(MarketMakingStrategy)
      .useValue(mockService)
      .compile();

    controller = module.get<MarketMakingController>(MarketMakingController);
    service = module.get<MarketMakingStrategy>(MarketMakingStrategy);
  });

  describe('createMarketMakingStrategy', () => {
    it('should call service.create with the correctly mapped command', async () => {
      const dto: MarketMakingStrategyDto = {
        pair: 'BTC/USDT',
        exchangeName: 'binance',
        bidSpread: 0.01,
        askSpread: 0.01,
        orderAmount: String(1),
        checkIntervalSeconds: 10,
        numberOfLayers: 1,
        priceSourceType: PriceSourceType.MID_PRICE,
        amountChangePerLayer: 1,
        amountChangeType: AmountChangeType.PERCENTAGE,
        ceilingPrice: 50000,
        floorPrice: 30000,
      };

      const expectedCommand: MarketMakingStrategyCommand = {
        userId: reqMock.user.userId,
        clientId: reqMock.user.clientId,
        sideA: 'BTC',
        sideB: 'USDT',
        exchangeName: 'binance',
        bidSpread: 0.01,
        askSpread: 0.01,
        orderAmount: new Decimal(1),
        checkIntervalSeconds: 10,
        numberOfLayers: 1,
        priceSourceType: PriceSourceType.MID_PRICE,
        amountChangePerLayer: 1,
        amountChangeType: AmountChangeType.PERCENTAGE,
        ceilingPrice: 50000,
        floorPrice: 30000,
      };

      jest.spyOn(service, 'create').mockResolvedValue(undefined);
      await controller.createMarketMakingStrategy(reqMock, dto);

      expect(service.create).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('pauseMarketMakingStrategy', () => {
    it('should call service.pause with the correctly mapped command', async () => {
      const dto: MarketMakingStrategyActionDto = { id: 1 };

      const expectedCommand: MarketMakingStrategyActionCommand = {
        id: 1,
        userId: reqMock.user.userId,
        clientId: reqMock.user.clientId,
      };

      jest.spyOn(service, 'pause').mockResolvedValue(undefined);
      await controller.pauseMarketMakingStrategy(reqMock, dto);

      expect(service.pause).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('stopMarketMakingStrategy', () => {
    it('should call service.stop with the correctly mapped command', async () => {
      const dto: MarketMakingStrategyActionDto = { id: 2 };

      const expectedCommand: MarketMakingStrategyActionCommand = {
        id: 2,
        userId: reqMock.user.userId,
        clientId: reqMock.user.clientId,
      };

      jest.spyOn(service, 'stop').mockResolvedValue(undefined);
      await controller.stopMarketMakingStrategy(reqMock, dto);

      expect(service.stop).toHaveBeenCalledWith(expectedCommand);
    });
  });

  describe('deleteMarketMakingStrategy', () => {
    it('should call service.delete with the correctly mapped command', async () => {
      const dto: MarketMakingStrategyActionDto = { id: 3 };

      const expectedCommand: MarketMakingStrategyActionCommand = {
        id: 3,
        userId: reqMock.user.userId,
        clientId: reqMock.user.clientId,
      };

      jest.spyOn(service, 'delete').mockResolvedValue(undefined);
      await controller.deleteMarketMakingStrategy(reqMock, dto);

      expect(service.delete).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
