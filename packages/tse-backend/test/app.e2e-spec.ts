import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormTestConfig } from '../src/common/config/typeorm-test.config';
import { ExchangeOperationService } from '../src/modules/exchange-operation/exchange-operation.service';
import { ExchangeOperationRepository } from '../src/modules/exchange-operation/exchange-operation.repository';
import {
  MarketOrderType,
  OrderStatus,
} from '../src/common/enums/exchange-operation.enums';
import { Order } from '../src/common/entities/order.entity';
import { Operation } from '../src/common/entities/operation.entity';

describe('ExchangeOperationService (e2e)', () => {
  let app: INestApplication;
  let service: ExchangeOperationService;
  let repository: ExchangeOperationRepository;
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
      providers: [ExchangeOperationService, ExchangeOperationRepository],
    }).compile();

    app = moduleRef.createNestApplication();
    service = moduleRef.get<ExchangeOperationService>(ExchangeOperationService);
    repository = moduleRef.get<ExchangeOperationRepository>(
      ExchangeOperationRepository,
    );
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
        side: 'buy',
        amount: 1,
        price: 50000,
      };

      const result = await service.saveOrderData(command);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.userId).toEqual(command.userId);
      expect(result.symbol).toEqual(command.symbol);
    });

    it('should throw BadRequestException for missing parameters', async () => {
      const command = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-1',
        clientId: 'client-1',
        exchangeName: 'exchange-1',
        symbol: '',
        side: '',
        amount: null,
      };

      await expect(service.saveOrderData(command)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on failure', async () => {
      jest
        .spyOn(repository, 'createOrder')
        .mockRejectedValueOnce(new Error('Database error'));

      const command = {
        orderType: MarketOrderType.LIMIT_ORDER,
        userId: 'user-1',
        clientId: 'client-1',
        exchangeName: 'exchange-1',
        symbol: 'BTC/USD',
        side: 'buy',
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
        side: 'buy',
        amount: 1,
        price: 50000,
      });

      const operationCommand = {
        id: newOrder.id,
        status: OrderStatus.CANCELLED,
        details: { info: 'Order details' },
      };
      await service.saveExchangeOperation(operationCommand);

      const updatedOrder = await repository.findOrdersByUser('user-2');

      expect(updatedOrder[0].status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      jest
        .spyOn(repository, 'updateOrderStatus')
        .mockRejectedValueOnce(new Error('Database error'));

      const command = {
        id: 1,
        status: OrderStatus.EXECUTED,
        details: { info: 'Order details' },
      };

      await expect(service.saveExchangeOperation(command)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
