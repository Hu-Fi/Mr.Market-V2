import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Withdraw } from '../../../../common/entities/withdraw.entity';
import { WithdrawRepository } from '../withdraw.repository';
import { WithdrawData } from '../../../../common/interfaces/transaction.interfaces';
import { Status } from '../../../../common/enums/transaction.enum';

const mockRepository = {
  save: jest.fn(),
};

describe('WithdrawRepository', () => {
  let withdrawRepository: WithdrawRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawRepository,
        {
          provide: getRepositoryToken(Withdraw),
          useValue: mockRepository,
        },
      ],
    }).compile();

    withdrawRepository = module.get<WithdrawRepository>(WithdrawRepository);
  });

  it('should be defined', () => {
    expect(withdrawRepository).toBeDefined();
  });

  it('should call repository.save with correct data', async () => {
    const data: WithdrawData = {
      userId: 'user1',
      assetId: 'asset1',
      amount: 100,
      destination: 'address1',
      status: Status.PENDING,
    };

    await withdrawRepository.save(data);

    expect(mockRepository.save).toHaveBeenCalledWith(data);
  });
});
