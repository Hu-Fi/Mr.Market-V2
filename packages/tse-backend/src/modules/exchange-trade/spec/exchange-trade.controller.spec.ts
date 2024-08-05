import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeTradeController } from '../exchange-trade.controller';
import { ExchangeTradeService } from '../exchange-trade.service';
import { AutomapperModule } from '@automapper/nestjs';
import {
  MarketTradeDto,
  MarketLimitDto,
  CancelOrderDto,
  MarketTradeCommand,
  MarketLimitCommand,
  CancelOrderCommand,
} from '../model/exchange-trade.model';
import { classes } from '@automapper/classes';
import { TradeSideType } from '../../../common/enums/exchange-operation.enums';
import { MarketTradeProfile } from '../exchange-trade.mapper';

describe('ExchangeTradeController', () => {
  let controller: ExchangeTradeController;
  let service: ExchangeTradeService;

  const mockExchangeTradeService = {
    executeMarketTrade: jest.fn(),
    executeLimitTrade: jest.fn(),
    cancelOrder: jest.fn(),
  };

  const marketTradeDtoFixture: MarketTradeDto = {
    userId: 'user123',
    clientId: 'client456',
    exchange: 'binance',
    symbol: 'BTC/USDT',
    side: TradeSideType.BUY,
    amount: 1,
  };

  const marketLimitDtoFixture: MarketLimitDto = {
    ...marketTradeDtoFixture,
    price: 30000,
  };

  const cancelOrderDtoFixture: CancelOrderDto = {
    exchange: 'binance',
    orderId: 'order789',
    symbol: 'BTC/USDT',
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
      const command: MarketTradeCommand = {
        userId: marketTradeDtoFixture.userId,
        clientId: marketTradeDtoFixture.clientId,
        exchange: marketTradeDtoFixture.exchange,
        symbol: marketTradeDtoFixture.symbol,
        side: marketTradeDtoFixture.side,
        amount: marketTradeDtoFixture.amount,
      };

      await controller.handleMarketTrade(marketTradeDtoFixture);
      expect(service.executeMarketTrade).toHaveBeenCalledWith(command);
    });
  });

  describe('handleLimitTrade', () => {
    it('should call executeLimitTrade with correct arguments', async () => {
      const command: MarketLimitCommand = {
        userId: marketLimitDtoFixture.userId,
        clientId: marketLimitDtoFixture.clientId,
        exchange: marketLimitDtoFixture.exchange,
        symbol: marketLimitDtoFixture.symbol,
        side: marketLimitDtoFixture.side,
        amount: marketLimitDtoFixture.amount,
        price: marketLimitDtoFixture.price,
      };

      await controller.handleLimitTrade(marketLimitDtoFixture);
      expect(service.executeLimitTrade).toHaveBeenCalledWith(command);
    });
  });

  describe('cancelOrder', () => {
    it('should call cancelOrder with correct arguments', async () => {
      const command: CancelOrderCommand = {
        exchange: cancelOrderDtoFixture.exchange,
        orderId: cancelOrderDtoFixture.orderId,
        symbol: cancelOrderDtoFixture.symbol,
      };

      await controller.cancelOrder(cancelOrderDtoFixture);
      expect(service.cancelOrder).toHaveBeenCalledWith(command);
    });
  });
});
