import { Test } from '@nestjs/testing';
import { INestApplication, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormTestConfig } from '../src/common/config/typeorm-test.config';
import { ExchangeOperationService } from '../src/modules/exchange-operation/exchange-operation.service';
import { OrderRepository } from '../src/modules/exchange-operation/order.repository';
import { OperationRepository } from '../src/modules/exchange-operation/operation.repository';
import { OrderService } from '../src/modules/exchange-operation/order.service';
import { OperationService } from '../src/modules/exchange-operation/operation.service';
import {
  MarketOrderType,
  OrderStatus,
  TradeSideType,
} from '../src/common/enums/exchange-operation.enums';
import { Order } from '../src/common/entities/order.entity';
import { Operation } from '../src/common/entities/operation.entity';

describe('ExchangeOperationService (e2e)', () => {
  let app: INestApplication;
  let service: ExchangeOperationService;
  let orderRepository: OrderRepository;
  let operationRepository: OperationRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const typeOrmTestConfigService = new TypeormTestConfig(
              configService,
            );
            const typeOrmConfig =
              typeOrmTestConfigService.getTypeOrmTestConfig();
            return {
              ...typeOrmConfig,
              entities: [Order, Operation],
            };
          },
        }),
        TypeOrmModule.forFeature([Order, Operation]),
      ],
      providers: [
        ExchangeOperationService,
        OrderService,
        OperationService,
        OrderRepository,
        OperationRepository,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    service = moduleRef.get<ExchangeOperationService>(ExchangeOperationService);
    orderRepository = moduleRef.get<OrderRepository>(OrderRepository);
    operationRepository =
      moduleRef.get<OperationRepository>(OperationRepository);
    dataSource = moduleRef.get<DataSource>(DataSource);
    await app.init();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('saveOrderData', () => {
    it('should create a new order successfully', async () => {
      const command = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-1',
        clientId: 'client-1',
        exchangeName: 'exchange-1',
        symbol: 'BTC/USD',
        side: TradeSideType.BUY,
        amount: 1,
        price: 50000,
      };

      const result = await service.saveOrderData(command);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.userId).toEqual(command.userId);
      expect(result.symbol).toEqual(command.symbol);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      jest
        .spyOn(orderRepository, 'create')
        .mockRejectedValueOnce(new Error('Database error'));

      const command = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-1',
        clientId: 'client-1',
        exchangeName: 'exchange-1',
        symbol: 'BTC/USD',
        side: TradeSideType.BUY,
        amount: 1,
        price: 50000,
      };

      await expect(service.saveOrderData(command)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('saveExchangeOperation', () => {
    it('should update order status and create a new operation', async () => {
      const newOrder = await service.saveOrderData({
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-2',
        clientId: 'client-2',
        exchangeName: 'exchange-2',
        symbol: 'BTC/USD',
        side: TradeSideType.BUY,
        amount: 1,
        price: 50000,
      });

      const operationCommand = {
        orderEntityId: newOrder.id,
        status: OrderStatus.CANCELLED,
        orderId: 'new-order-id',
        details: { info: 'Order details' },
      };
      await service.saveExchangeOperation(operationCommand);

      const updatedOrder = await orderRepository.findById(newOrder.id);

      expect(updatedOrder.status).toBe(OrderStatus.CANCELLED);
      expect(updatedOrder.orderId).toBe('new-order-id');
    });

    it('should throw InternalServerErrorException on failure', async () => {
      jest
        .spyOn(orderRepository, 'findById')
        .mockRejectedValueOnce(new Error('Database error'));

      const command = {
        orderEntityId: 1,
        status: OrderStatus.EXECUTED,
        orderId: 'order-id',
        details: { info: 'Order details' },
      };

      await expect(service.saveExchangeOperation(command)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
