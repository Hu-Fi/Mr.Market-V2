import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderRepository } from '../order.repository';
import { Order } from '../../../common/entities/order.entity';

describe('OrderRepository', () => {
  let repository: OrderRepository;
  let orderRepository: Repository<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<OrderRepository>(OrderRepository);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
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

      jest.spyOn(orderRepository, 'save').mockResolvedValue(expectedOrder);

      const order = await repository.create(transactionData);
      expect(order).toEqual(expectedOrder);
    });
  });

  describe('findById', () => {
    it('should return an order by ID', async () => {
      const id = 1;
      const expectedOrder = new Order();

      jest.spyOn(orderRepository, 'findOne').mockResolvedValue(expectedOrder);

      const order = await repository.findById(id);
      expect(order).toEqual(expectedOrder);
    });
  });
});
