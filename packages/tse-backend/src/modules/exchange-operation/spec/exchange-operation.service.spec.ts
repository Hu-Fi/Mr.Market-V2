import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ExchangeOperationService } from '../exchange-operation.service';
import { OrderService } from '../order.service';
import { CustomLogger } from '../../logger/logger.service';
import {
  CreateLimitOrderCommand,
  ExchangeOperationCommand,
} from '../model/exchange-operation.model';
import { TradeOrder } from '../../../common/entities/trade-order.entity';
import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../../../common/enums/exchange-operation.enums';
import { Decimal } from 'decimal.js';

describe('ExchangeOperationService', () => {
  let service: ExchangeOperationService;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeOperationService,
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
            persistOrderActivity: jest.fn(),
          },
        },
        {
          provide: CustomLogger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExchangeOperationService>(ExchangeOperationService);
    orderService = module.get<OrderService>(OrderService);
  });

  describe('saveOrderData', () => {
    it('should save order and return it', async () => {
      const command: CreateLimitOrderCommand = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-id',
        clientId: 'client-id',
        exchangeName: 'exchange-name',
        symbol: 'BTC/USD',
        side: TradeSideType.BUY,
        amount: new Decimal(1),
        price: 10000,
      };

      const expectedOrder = new TradeOrder();
      jest.spyOn(orderService, 'createOrder').mockResolvedValue(expectedOrder);

      const result = await service.saveOrderData(command);

      expect(result).toEqual(expectedOrder);
      expect(orderService.createOrder).toHaveBeenCalledWith({
        userId: command.userId,
        clientId: command.clientId,
        exchangeName: command.exchangeName,
        symbol: command.symbol,
        type: command.orderType,
        side: command.side,
        amount: command.amount,
        status: OrderStatus.PENDING,
        price: command.price,
        orderExtId: null,
      });
    });

    it('should log an error and throw InternalServerErrorException on failure', async () => {
      const command: CreateLimitOrderCommand = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-id',
        clientId: 'client-id',
        exchangeName: 'exchange-name',
        symbol: 'BTC/USD',
        side: TradeSideType.BUY,
        amount: new Decimal(1),
        price: 10000,
      };

      jest
        .spyOn(orderService, 'createOrder')
        .mockRejectedValue(new Error('Failed to save order'));

      await expect(service.saveOrderData(command)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('saveExchangeOperation', () => {
    it('should save exchange operation and update order status', async () => {
      const command: ExchangeOperationCommand = {
        orderEntityId: 1,
        status: OrderStatus.EXECUTED,
        orderExtId: 'order-id',
        details: { info: 'some details' },
      };

      jest
        .spyOn(orderService, 'persistOrderActivity')
        .mockResolvedValue(undefined);

      await service.saveExchangeOperation(command);

      expect(orderService.persistOrderActivity).toHaveBeenCalledWith(command);
    });

    it('should log an error and throw InternalServerErrorException on failure', async () => {
      const command: ExchangeOperationCommand = {
        orderEntityId: 1,
        status: OrderStatus.EXECUTED,
        orderExtId: 'order-id',
        details: { info: 'some details' },
      };

      jest
        .spyOn(orderService, 'persistOrderActivity')
        .mockRejectedValue(new Error('Failed to update order status'));

      await expect(service.saveExchangeOperation(command)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
