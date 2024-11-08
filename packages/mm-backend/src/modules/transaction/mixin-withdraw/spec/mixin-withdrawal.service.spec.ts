import { Test, TestingModule } from '@nestjs/testing';
import { MixinGateway } from '../../../../integrations/mixin.gateway';
import { MixinWithdrawalRepository } from '../mixin-withdrawal.repository';
import { MixinWithdrawalService } from '../mixin-withdrawal.service';
import { WithdrawCommand } from '../model/mixin-withdrawal.model';
import { MixinWithdrawalStatus } from '../../../../common/enums/transaction.enum';
import { MixinWithdrawResponse } from '../../../../common/interfaces/transaction.interfaces';

jest.mock('typeorm-transactional', () => ({
  Transactional: () =>
    jest.fn((_target: any, _key: string, descriptor: PropertyDescriptor) => {
      return descriptor;
    }),
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

describe('WithdrawService', () => {
  let service: MixinWithdrawalService;

  const mockMixinGateway = {
    handleWithdrawal: jest.fn().mockResolvedValue({
      transaction_hash: 'mockTransactionHash',
      snapshot_id: 'mockSnapshotId',
    }),
  };

  const mockWithdrawRepository = {
    save: jest.fn().mockResolvedValue({ id: 1 }),
    updateTransactionHashById: jest.fn(),
    updateStatusById: jest.fn(),
    findWithdrawalsByStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MixinWithdrawalService,
        {
          provide: MixinGateway,
          useValue: mockMixinGateway,
        },
        {
          provide: MixinWithdrawalRepository,
          useValue: mockWithdrawRepository,
        },
      ],
    }).compile();

    service = module.get<MixinWithdrawalService>(MixinWithdrawalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('withdraw', () => {
    it('should call save, updateUserBalance, and handleWithdrawal', async () => {
      const command: WithdrawCommand = {
        userId: 'user1',
        assetId: 'asset1',
        amount: '100',
        destination: 'address1',
      };

      const result = await service.withdraw(command);

      expect(mockWithdrawRepository.save).toHaveBeenCalledWith({
        ...command,
        amount: Number(command.amount),
        status: MixinWithdrawalStatus.SIGNED,
      });

      expect(mockMixinGateway.handleWithdrawal).toHaveBeenCalledWith(command);

      expect(result).toEqual<MixinWithdrawResponse>({
        transactionHash: 'mockTransactionHash',
        snapshotId: 'mockSnapshotId',
      });
    });

    it('should update the transaction hash after withdrawal', async () => {
      const command: WithdrawCommand = {
        userId: 'user1',
        assetId: 'asset1',
        amount: '100',
        destination: 'address1',
      };

      await service.withdraw(command);

      expect(
        mockWithdrawRepository.updateTransactionHashById,
      ).toHaveBeenCalledWith(1, 'mockTransactionHash');
    });
  });

  describe('getSignedWithdrawals', () => {
    it('should call repository to find signed withdrawals', async () => {
      await service.getSignedWithdrawals();

      expect(
        mockWithdrawRepository.findWithdrawalsByStatus,
      ).toHaveBeenCalledWith(MixinWithdrawalStatus.SIGNED);
    });
  });

  describe('updateWithdrawalStatus', () => {
    it('should update the withdrawal status by ID', async () => {
      const withdrawalId = 1;
      const status = MixinWithdrawalStatus.SPENT;

      await service.updateWithdrawalStatus(withdrawalId, status);

      expect(mockWithdrawRepository.updateStatusById).toHaveBeenCalledWith(
        withdrawalId,
        status,
      );
    });
  });

  describe('updateWithdrawalTransactionHash', () => {
    it('should update the transaction hash by withdrawal ID', async () => {
      const withdrawalId = 1;
      const txHash = 'new-transaction-hash';

      await service.updateWithdrawalTransactionHash(withdrawalId, txHash);

      expect(
        mockWithdrawRepository.updateTransactionHashById,
      ).toHaveBeenCalledWith(withdrawalId, txHash);
    });
  });
});
