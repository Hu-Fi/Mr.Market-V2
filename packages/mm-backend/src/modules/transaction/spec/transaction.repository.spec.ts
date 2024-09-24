import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Withdrawal } from '../../../common/entities/withdrawal.entity';
import { DepositRepository } from '../deposit.repository';

const mockRepository = {

};

describe('TransactionRepository', () => {
  let transactionRepository: DepositRepository;
  let repository: Repository<Withdrawal>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositRepository,
        {
          provide: getRepositoryToken(Withdrawal),
          useValue: mockRepository,
        },
      ],
    }).compile();

    transactionRepository = module.get<DepositRepository>(DepositRepository);
    repository = module.get<Repository<Withdrawal>>(getRepositoryToken(Withdrawal));
  });

  it('should be defined', () => {
    expect(transactionRepository).toBeDefined();
  });

});
