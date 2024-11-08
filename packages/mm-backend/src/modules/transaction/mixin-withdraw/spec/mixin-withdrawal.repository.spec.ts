import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MixinWithdrawal } from '../../../../common/entities/mixin-withdrawal.entity';
import { MixinWithdrawalRepository } from '../mixin-withdrawal.repository';
import { MixinWithdrawalData } from '../../../../common/interfaces/transaction.interfaces';
import { MixinWithdrawalStatus } from '../../../../common/enums/transaction.enum';

const mockRepository = {
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

describe('WithdrawRepository', () => {
  let withdrawRepository: MixinWithdrawalRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MixinWithdrawalRepository,
        {
          provide: getRepositoryToken(MixinWithdrawal),
          useValue: mockRepository,
        },
      ],
    }).compile();

    withdrawRepository = module.get<MixinWithdrawalRepository>(
      MixinWithdrawalRepository,
    );
  });

  it('should be defined', () => {
    expect(withdrawRepository).toBeDefined();
  });

  it('should call repository.save with correct data', async () => {
    const data: MixinWithdrawalData = {
      userId: 'user1',
      assetId: 'asset1',
      amount: 100,
      destination: 'address1',
      status: MixinWithdrawalStatus.SIGNED,
    };

    await withdrawRepository.save(data);

    expect(mockRepository.save).toHaveBeenCalledWith(data);
  });

  describe('findWithdrawalsByStatus', () => {
    it('should return withdrawals with the specified status', async () => {
      const status = MixinWithdrawalStatus.SIGNED;
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
      const status = MixinWithdrawalStatus.SPENT;

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
