import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeTradeController } from '../exchange-trade.controller';
import { ExchangeTradeService } from '../exchange-trade.service';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { MarketTradeProfile } from '../exchange-trade.mapper';
import {
  cancelOrderCommandFixture,
  cancelOrderDtoFixture,
  marketLimitCommandFixture,
  marketLimitDtoFixture,
  marketTradeCommandFixture,
  marketTradeDtoFixture,
  mockReq,
} from './exchange-trade.fixtures';

describe('ExchangeTradeController', () => {
  let controller: ExchangeTradeController;
  let service: ExchangeTradeService;

  const mockExchangeTradeService = {
    executeMarketTrade: jest.fn(),
    executeLimitTrade: jest.fn(),
    cancelOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeTradeController],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [ExchangeTradeService, MarketTradeProfile],
    })
      .overrideProvider(ExchangeTradeService)
      .useValue(mockExchangeTradeService)
      .compile();

    controller = module.get<ExchangeTradeController>(ExchangeTradeController);
    service = module.get<ExchangeTradeService>(ExchangeTradeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleMarketTrade', () => {
    it('should call executeMarketTrade with correct arguments', async () => {
      await controller.handleMarketTrade(mockReq, marketTradeDtoFixture);
      expect(service.executeMarketTrade).toHaveBeenCalledWith(
        marketTradeCommandFixture,
      );
    });
  });

  describe('handleLimitTrade', () => {
    it('should call executeLimitTrade with correct arguments', async () => {
      await controller.handleLimitTrade(mockReq, marketLimitDtoFixture);
      expect(service.executeLimitTrade).toHaveBeenCalledWith(
        marketLimitCommandFixture,
      );
    });
  });

  describe('cancelOrder', () => {
    it('should call cancelOrder with correct arguments', async () => {
      await controller.cancelOrder(mockReq, cancelOrderDtoFixture);
      expect(service.cancelOrder).toHaveBeenCalledWith(
        cancelOrderCommandFixture,
      );
    });
  });
});
