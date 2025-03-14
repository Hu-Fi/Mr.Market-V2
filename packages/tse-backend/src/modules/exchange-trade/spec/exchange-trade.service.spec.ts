import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeTradeService } from '../exchange-trade.service';
import { ExchangeRegistryService } from '../../exchange-registry/exchange-registry.service';
import { ExchangeOperationService } from '../../exchange-operation/exchange-operation.service';
import { CustomLogger } from '../../logger/logger.service';
import {
  MarketTradeCommand,
  MarketLimitCommand,
  CancelOrderCommand,
} from '../model/exchange-trade.model';
import {
  MarketOrderType,
  OrderStatus,
} from '../../../common/enums/exchange-operation.enums';
import {
  CancelOperationCommand,
  OperationCommand,
} from '../../exchange-operation/model/exchange-operation.model';

describe('ExchangeTradeService', () => {
  let service: ExchangeTradeService;

  const mockExchangeRegistryService = {
    getExchangeByName: jest.fn(),
  };

  const mockExchangeOperationService = {
    saveOrderData: jest.fn(),
    saveExchangeOperation: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const exchangeInstanceMock = {
    createOrder: jest.fn(),
    cancelOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeTradeService,
        {
          provide: ExchangeRegistryService,
          useValue: mockExchangeRegistryService,
        },
        {
          provide: ExchangeOperationService,
          useValue: mockExchangeOperationService,
        },
        { provide: CustomLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<ExchangeTradeService>(ExchangeTradeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeMarketTrade', () => {
    const marketTradeCommand: MarketTradeCommand = {
      userId: 'user123',
      clientId: 'client456',
      exchange: 'binance',
      symbol: 'BTC/USDT',
      side: 'buy',
      amount: 1,
    };

    it('should execute market trade successfully', async () => {
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        exchangeInstanceMock,
      );
      mockExchangeOperationService.saveOrderData.mockResolvedValue({ id: 1 });
      exchangeInstanceMock.createOrder.mockResolvedValue({ id: 'order123' });

      await service.executeMarketTrade(marketTradeCommand);

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('binance');
      expect(mockExchangeOperationService.saveOrderData).toHaveBeenCalledWith({
        userId: 'user123',
        clientId: 'client456',
        exchangeName: 'binance',
        symbol: 'BTC/USDT',
        side: 'buy',
        amount: 1,
        price: undefined,
        orderType: MarketOrderType.MARKET_ORDER,
      });
      expect(exchangeInstanceMock.createOrder).toHaveBeenCalledWith(
        'BTC/USDT',
        MarketOrderType.MARKET_ORDER,
        'buy',
        1,
      );
      expect(
        mockExchangeOperationService.saveExchangeOperation,
      ).toHaveBeenCalledWith({
        orderEntityId: 1,
        status: OrderStatus.EXECUTED,
        orderExtId: 'order123',
        details: { id: 'order123' },
      } as OperationCommand);
    });

    it('should handle market trade error', async () => {
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        exchangeInstanceMock,
      );
      mockExchangeOperationService.saveOrderData.mockResolvedValue({ id: 1 });
      exchangeInstanceMock.createOrder.mockRejectedValue(
        new Error('Trade failed'),
      );

      await expect(
        service.executeMarketTrade(marketTradeCommand),
      ).rejects.toThrow('Trade failed');

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('binance');
      expect(mockExchangeOperationService.saveOrderData).toHaveBeenCalledWith({
        userId: 'user123',
        clientId: 'client456',
        exchangeName: 'binance',
        symbol: 'BTC/USDT',
        side: 'buy',
        amount: 1,
        price: undefined,
        orderType: MarketOrderType.MARKET_ORDER,
      });
      expect(
        mockExchangeOperationService.saveExchangeOperation,
      ).toHaveBeenCalledWith({
        details: new Error('Trade failed'),
        orderEntityId: 1,
        orderExtId: undefined,
        status: OrderStatus.FAILED,
      } as OperationCommand);
    });
  });

  describe('executeLimitTrade', () => {
    const marketLimitCommand: MarketLimitCommand = {
      userId: 'user123',
      clientId: 'client456',
      exchange: 'binance',
      symbol: 'BTC/USDT',
      side: 'sell',
      amount: 1,
      price: 30000,
    };

    it('should execute limit trade successfully', async () => {
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        exchangeInstanceMock,
      );
      mockExchangeOperationService.saveOrderData.mockResolvedValue({ id: 1 });
      exchangeInstanceMock.createOrder.mockResolvedValue({ id: 'order123' });

      await service.executeLimitTrade(marketLimitCommand);

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('binance');
      expect(mockExchangeOperationService.saveOrderData).toHaveBeenCalledWith({
        userId: 'user123',
        clientId: 'client456',
        exchangeName: 'binance',
        symbol: 'BTC/USDT',
        side: 'sell',
        amount: 1,
        price: 30000,
        orderType: MarketOrderType.LIMIT_ORDER,
      });
      expect(exchangeInstanceMock.createOrder).toHaveBeenCalledWith(
        'BTC/USDT',
        MarketOrderType.LIMIT_ORDER,
        'sell',
        1,
        30000,
      );
      expect(
        mockExchangeOperationService.saveExchangeOperation,
      ).toHaveBeenCalledWith({
        details: { id: 'order123' },
        orderEntityId: 1,
        orderExtId: 'order123',
        status: OrderStatus.EXECUTED,
      } as OperationCommand);
    });

    it('should handle limit trade error', async () => {
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        exchangeInstanceMock,
      );
      mockExchangeOperationService.saveOrderData.mockResolvedValue({ id: 1 });
      exchangeInstanceMock.createOrder.mockRejectedValue(
        new Error('Trade failed'),
      );

      await expect(
        service.executeLimitTrade(marketLimitCommand),
      ).rejects.toThrow('Trade failed');

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('binance');
      expect(mockExchangeOperationService.saveOrderData).toHaveBeenCalledWith({
        userId: 'user123',
        clientId: 'client456',
        exchangeName: 'binance',
        symbol: 'BTC/USDT',
        side: 'sell',
        amount: 1,
        price: 30000,
        orderType: MarketOrderType.LIMIT_ORDER,
      });
      expect(
        mockExchangeOperationService.saveExchangeOperation,
      ).toHaveBeenCalledWith({
        details: new Error('Trade failed'),
        orderEntityId: 1,
        orderExtId: undefined,
        status: OrderStatus.FAILED,
      } as OperationCommand);
    });
  });

  describe('cancelOrder', () => {
    const cancelOrderCommand: CancelOrderCommand = {
      exchange: 'binance',
      orderId: 'order123',
      symbol: 'BTC/USDT',
    };

    it('should cancel order successfully', async () => {
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        exchangeInstanceMock,
      );
      exchangeInstanceMock.cancelOrder.mockResolvedValue({ id: 'order123' });

      await service.cancelOrder(cancelOrderCommand);

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('binance');
      expect(exchangeInstanceMock.cancelOrder).toHaveBeenCalledWith(
        'order123',
        'BTC/USDT',
      );
      expect(
        mockExchangeOperationService.saveExchangeOperation,
      ).toHaveBeenCalledWith({
        orderExtId: 'order123',
        status: OrderStatus.CANCELED,
        details: { id: 'order123' },
      } as CancelOperationCommand);
    });

    it('should handle cancel order error', async () => {
      mockExchangeRegistryService.getExchangeByName.mockReturnValue(
        exchangeInstanceMock,
      );
      exchangeInstanceMock.cancelOrder.mockRejectedValue(
        new Error('Cancel failed'),
      );

      await expect(service.cancelOrder(cancelOrderCommand)).rejects.toThrow(
        'Cancel failed',
      );

      expect(
        mockExchangeRegistryService.getExchangeByName,
      ).toHaveBeenCalledWith('binance');
      expect(
        mockExchangeOperationService.saveExchangeOperation,
      ).toHaveBeenCalledWith({
        orderEntityId: null,
        orderExtId: 'order123',
        status: OrderStatus.FAILED,
        details: new Error('Cancel failed'),
      } as OperationCommand);
    });
  });
});
