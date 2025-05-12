import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationRepository } from '../operation.repository';
import { TradeOperation } from '../../../common/entities/trade-operation.entity';
import { TradeOrder } from '../../../common/entities/trade-order.entity';
import { OrderStatus } from '../../../common/enums/exchange-operation.enums';

describe('OperationRepository', () => {
  let repository: OperationRepository;
  let operationRepository: Repository<TradeOperation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationRepository,
        {
          provide: getRepositoryToken(TradeOperation),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<OperationRepository>(OperationRepository);
    operationRepository = module.get<Repository<TradeOperation>>(
      getRepositoryToken(TradeOperation),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('saveOperation', () => {
    it('should save a new operation', async () => {
      const order = new TradeOrder();
      const status = OrderStatus.EXECUTED;
      const details = { detail: 'test-detail' };

      const expectedOperation = new TradeOperation();

      jest
        .spyOn(operationRepository, 'save')
        .mockResolvedValue(expectedOperation);

      const operation = await repository.create({
        status,
        details,
        order,
      });

      expect(operation).toEqual(expectedOperation);
      expect(operationRepository.save).toHaveBeenCalledWith({
        status,
        details,
        order,
      });
    });
  });
});
