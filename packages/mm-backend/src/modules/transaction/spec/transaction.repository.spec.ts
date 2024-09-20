import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../common/entities/transaction.entity';
import { TransactionRepository } from '../transaction.repository';

const mockRepository = {

};

describe('TransactionRepository', () => {
  let transactionRepository: TransactionRepository;
  let repository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepository,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    transactionRepository = module.get<TransactionRepository>(TransactionRepository);
    repository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  it('should be defined', () => {
    expect(transactionRepository).toBeDefined();
  });

});
