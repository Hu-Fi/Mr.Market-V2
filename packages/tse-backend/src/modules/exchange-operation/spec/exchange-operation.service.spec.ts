import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ExchangeOperationService } from '../exchange-operation.service';
import { ExchangeOperationRepository } from '../exchange-operation.repository';
import { CustomLogger } from '../../logger/logger.service';
import {
  CreateLimitOrderCommand,
  ExchangeOperationCommand,
  OrderCommand,
} from '../model/exchange-operation.model';
import { Order } from '../../../common/entities/order.entity';
import {
  MarketOrderType,
  OrderStatus,
} from '../../../common/enums/exchange-operation.enums';

describe('ExchangeOperationService', () => {
  let service: ExchangeOperationService;
  let repository: ExchangeOperationRepository;
  let logger: CustomLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeOperationService,
        {
          provide: ExchangeOperationRepository,
          useValue: {
            createOrder: jest.fn(),
            updateOrderStatus: jest.fn(),
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
    repository = module.get<ExchangeOperationRepository>(
      ExchangeOperationRepository,
    );
    logger = module.get<CustomLogger>(CustomLogger);
  });

  describe('saveOrderData', () => {
    it('should throw BadRequestException if required parameters are missing', async () => {
      const command: OrderCommand = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-id',
        clientId: 'client-id',
        exchangeName: 'exchange-name',
        symbol: '',
        side: '',
        amount: null,
      };

      await expect(service.saveOrderData(command)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should save order and return it', async () => {
      const command: CreateLimitOrderCommand = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-id',
        clientId: 'client-id',
        exchangeName: 'exchange-name',
        symbol: 'BTC/USD',
        side: 'buy',
        amount: 1,
        price: 10000,
      };

      const expectedOrder = new Order();
      jest.spyOn(repository, 'createOrder').mockResolvedValue(expectedOrder);

      const result = await service.saveOrderData(command);

      expect(result).toEqual(expectedOrder);
      expect(repository.createOrder).toHaveBeenCalledWith({
        userId: command.userId,
        clientId: command.clientId,
        exchangeName: command.exchangeName,
        symbol: command.symbol,
        type: command.orderType,
        side: command.side,
        amount: command.amount,
        status: OrderStatus.PENDING,
        price: command.price,
        orderId: null,
      });
    });

    it('should log an error and throw InternalServerErrorException on failure', async () => {
      const command: CreateLimitOrderCommand = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-id',
        clientId: 'client-id',
        exchangeName: 'exchange-name',
        symbol: 'BTC/USD',
        side: 'buy',
        amount: 1,
        price: 10000,
      };

      jest
        .spyOn(repository, 'createOrder')
        .mockRejectedValue(new Error('Failed to save order'));

      await expect(service.saveOrderData(command)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('saveExchangeOperation', () => {
    it('should save exchange operation and update order status', async () => {
      const command: ExchangeOperationCommand = {
        id: 1,
        status: OrderStatus.EXECUTED,
        details: { info: 'some details' },
      };

      jest.spyOn(repository, 'updateOrderStatus').mockResolvedValue(undefined);

      await service.saveExchangeOperation(command);

      expect(repository.updateOrderStatus).toHaveBeenCalledWith(
        command.id,
        command.status,
        command.details,
      );
    });

    it('should log an error and throw InternalServerErrorException on failure', async () => {
      const command: ExchangeOperationCommand = {
        id: 1,
        status: OrderStatus.EXECUTED,
        details: { info: 'some details' },
      };

      jest
        .spyOn(repository, 'updateOrderStatus')
        .mockRejectedValue(new Error('Failed to update order status'));

      await expect(service.saveExchangeOperation(command)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
