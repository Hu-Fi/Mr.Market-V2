import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Withdraw } from '../../../../common/entities/withdraw.entity';
import { WithdrawRepository } from '../withdraw.repository';
import { WithdrawData } from '../../../../common/interfaces/transaction.interfaces';
import { WithdrawalStatus } from '../../../../common/enums/transaction.enum';

const mockRepository = {
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
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
      status: WithdrawalStatus.SIGNED,
    };

    await withdrawRepository.save(data);

    expect(mockRepository.save).toHaveBeenCalledWith(data);
  });

  describe('findWithdrawalsByStatus', () => {
    it('should return withdrawals with the specified status', async () => {
      const status = WithdrawalStatus.SIGNED;
      const withdrawals = [
        {
          id: 1,
          userId: 'user1',
          assetId: 'asset1',
          amount: 100,
          destination: 'address1',
          status: status,
        },
      ];

      mockRepository.find.mockResolvedValue(withdrawals);

      const result = await withdrawRepository.findWithdrawalsByStatus(status);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { status } });
      expect(result).toEqual(withdrawals);
    });
  });

  describe('updateStatusById', () => {
    it('should update the status of a withdrawal by ID', async () => {
      const withdrawalId = 1;
      const status = WithdrawalStatus.SPENT;

      await withdrawRepository.updateStatusById(withdrawalId, status);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: withdrawalId },
        { status },
      );
    });
  });

  describe('updateTransactionHashById', () => {
    it('should update the transaction hash of a withdrawal by ID', async () => {
      const withdrawalId = 1;
      const txHash = 'new-transaction-hash';

      await withdrawRepository.updateTransactionHashById(withdrawalId, txHash);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: withdrawalId },
        { transactionHash: txHash },
      );
    });
  });
});
