import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationRepository } from '../operation.repository';
import { Operation } from '../../../common/entities/operation.entity';
import { Order } from '../../../common/entities/order.entity';
import { OrderStatus } from '../../../common/enums/exchange-operation.enums';

describe('OperationRepository', () => {
  let repository: OperationRepository;
  let operationRepository: Repository<Operation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationRepository,
        {
          provide: getRepositoryToken(Operation),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<OperationRepository>(OperationRepository);
    operationRepository = module.get<Repository<Operation>>(
      getRepositoryToken(Operation),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('saveOperation', () => {
    it('should save a new operation', async () => {
      const order = new Order();
      const status = OrderStatus.EXECUTED;
      const details = { detail: 'test-detail' };

      const expectedOperation = new Operation();

      jest
        .spyOn(operationRepository, 'save')
        .mockResolvedValue(expectedOperation);

      const operation = await repository.save({
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
