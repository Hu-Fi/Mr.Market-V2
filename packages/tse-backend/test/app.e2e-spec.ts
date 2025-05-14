import { Test } from '@nestjs/testing';
import { INestApplication, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { TradeOrder } from '../src/common/entities/trade-order.entity';
import { TradeOperation } from '../src/common/entities/trade-operation.entity';
import {
  CreateLimitOrderCommand,
  OperationCommand,
} from '../src/modules/exchange-operation/model/exchange-operation.model';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Decimal } from 'decimal.js';

describe('ExchangeOperationService (e2e)', () => {
  let app: INestApplication;
  let service: ExchangeOperationService;
  let orderRepository: OrderRepository;
  let dataSource: DataSource;
  let postgresContainer: StartedPostgreSqlContainer;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer()
      .withName('testcontainer')
      .withDatabase('testcontainer')
      .start();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return {
              type: 'postgres',
              host: postgresContainer.getHost(),
              port: postgresContainer.getPort(),
              username: postgresContainer.getUsername(),
              password: postgresContainer.getPassword(),
              database: postgresContainer.getDatabase(),
              entities: [TradeOrder, TradeOperation],
              synchronize: true,
            };
          },
        }),
        TypeOrmModule.forFeature([TradeOrder, TradeOperation]),
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
    dataSource = moduleRef.get<DataSource>(DataSource);
    await app.init();
  }, 30000);

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
    await postgresContainer.stop();
  });

  describe('saveOrderData', () => {
    it('should create a new order successfully', async () => {
      const command: CreateLimitOrderCommand = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-1',
        clientId: 'client-1',
        exchangeName: 'exchange-1',
        symbol: 'BTC/USD',
        side: TradeSideType.BUY,
        amount: new Decimal(1),
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

      const command: CreateLimitOrderCommand = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-1',
        clientId: 'client-1',
        exchangeName: 'exchange-1',
        symbol: 'BTC/USD',
        side: TradeSideType.BUY,
        amount: new Decimal(1),
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
        amount: new Decimal(1),
        price: 50000,
      } as CreateLimitOrderCommand);

      const operationCommand: OperationCommand = {
        orderEntityId: newOrder.id,
        status: OrderStatus.EXECUTED,
        orderExtId: 'new-order-id',
        details: { info: 'Order details' },
      };
      await service.saveExchangeOperation(operationCommand);

      const updatedOrder = await orderRepository.findById(newOrder.id);

      expect(updatedOrder.status).toBe(OrderStatus.EXECUTED);
      expect(updatedOrder.orderExtId).toBe('new-order-id');
    });

    it('should throw InternalServerErrorException on failure', async () => {
      jest
        .spyOn(orderRepository, 'findById')
        .mockRejectedValueOnce(new Error('Database error'));

      const command: OperationCommand = {
        orderEntityId: 1,
        status: OrderStatus.EXECUTED,
        orderExtId: 'order-id',
        details: { info: 'Order details' },
      };

      await expect(service.saveExchangeOperation(command)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
