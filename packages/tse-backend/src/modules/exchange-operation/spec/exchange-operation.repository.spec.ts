import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeOperationRepository } from '../exchange-operation.repository';
import { Order } from '../../../common/entities/order.entity';
import { Operation } from '../../../common/entities/operation.entity';
import { OrderStatus } from '../../../common/enums/exchange-operation.enums';

describe('ExchangeOperationRepository', () => {
  let repository: ExchangeOperationRepository;
  let orderRepository: Repository<Order>;
  let operationRepository: Repository<Operation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeOperationRepository,
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Operation),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<ExchangeOperationRepository>(
      ExchangeOperationRepository,
    );
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    operationRepository = module.get<Repository<Operation>>(
      getRepositoryToken(Operation),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findOrdersByUser', () => {
    it('should return orders by user ID', async () => {
      const userId = 'test-user-id';
      const expectedOrders = [new Order()];

      jest.spyOn(orderRepository, 'find').mockResolvedValue(expectedOrders);

      const orders = await repository.findOrdersByUser(userId);
      expect(orders).toEqual(expectedOrders);
    });
  });

  describe('findOrdersByClient', () => {
    it('should return orders by client ID', async () => {
      const clientId = 'test-client-id';
      const expectedOrders = [new Order()];

      jest.spyOn(orderRepository, 'find').mockResolvedValue(expectedOrders);

      const orders = await repository.findOrdersByClient(clientId);
      expect(orders).toEqual(expectedOrders);
    });
  });

  describe('createOrder', () => {
    it('should create and save a new order', async () => {
      const transactionData = {
        userId: 'test-user-id',
        exchangeName: 'test-exchange',
        symbol: 'BTC/USD',
        side: 'buy',
        type: 'limit',
        amount: 1.0,
        price: 10000.0,
      };
      const expectedOrder = new Order();

      jest.spyOn(orderRepository, 'create').mockReturnValue(expectedOrder);
      jest.spyOn(orderRepository, 'save').mockResolvedValue(expectedOrder);

      const order = await repository.createOrder(transactionData);
      expect(order).toEqual(expectedOrder);
    });
  });

  describe('updateOrderId', () => {
    it('should update the orderId of an order', async () => {
      const id = 1;
      const orderId = 'new-order-id';

      jest.spyOn(orderRepository, 'update').mockResolvedValue(undefined);

      await repository.updateOrderId(id, orderId);
      expect(orderRepository.update).toHaveBeenCalledWith({ id }, { orderId });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the status of an order and create a new operation', async () => {
      const id = 1;
      const status = OrderStatus.EXECUTED;
      const details = { detail: 'test-detail' };
      const mockOrder = new Order();

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(mockOrder);
      jest.spyOn(orderRepository, 'save').mockResolvedValue(mockOrder);
      jest
        .spyOn(operationRepository, 'create')
        .mockReturnValue(new Operation());
      jest
        .spyOn(operationRepository, 'save')
        .mockResolvedValue(new Operation());

      await repository.updateOrderStatus(id, status, details);

      expect(orderRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(orderRepository.save).toHaveBeenCalledWith(mockOrder);
      expect(operationRepository.create).toHaveBeenCalledWith({
        status,
        details,
        order: mockOrder,
      });
      expect(operationRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if the order is not found', async () => {
      const id = 1;
      const status = 'completed';
      const details = { detail: 'test-detail' };

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(null);

      await expect(
        repository.updateOrderStatus(id, status, details),
      ).rejects.toThrow('Order not found');
    });
  });
});
