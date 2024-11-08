import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MixinDepositRepository } from '../mixin-deposit.repository';
import { MixinDeposit } from '../../../../common/entities/mixin-deposit.entity';
import { MixinDepositStatus } from '../../../../common/enums/transaction.enum';

const mockRepository = {
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

describe('DepositRepository', () => {
  let depositRepository: MixinDepositRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MixinDepositRepository,
        {
          provide: getRepositoryToken(MixinDeposit),
          useValue: mockRepository,
        },
      ],
    }).compile();

    depositRepository = module.get<MixinDepositRepository>(
      MixinDepositRepository,
    );
  });

  it('should be defined', () => {
    expect(depositRepository).toBeDefined();
  });

  describe('save', () => {
    it('should save a deposit and return it', async () => {
      const transactionData = {
        userId: 'user-123',
        amount: 100,
        assetId: 'asset-456',
        status: MixinDepositStatus.PENDING,
        chainId: 'chainId-123',
        destination: 'dest-123',
      };
      const savedDeposit = { id: 1, ...transactionData };

      mockRepository.save.mockResolvedValue(savedDeposit);

      const result = await depositRepository.save(transactionData);

      expect(mockRepository.save).toHaveBeenCalledWith(transactionData);
      expect(result).toEqual(savedDeposit);
    });
  });

  describe('findByStatus', () => {
    it('should return deposits with the specified status', async () => {
      const status = MixinDepositStatus.PENDING;
      const deposits = [
        {
          id: 1,
          userId: 'user-123',
          amount: 100,
          assetId: 'asset-456',
          status,
        },
      ];

      mockRepository.find.mockResolvedValue(deposits);

      const result = await depositRepository.findByStatus(status);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { status } });
      expect(result).toEqual(deposits);
    });
  });

  describe('updateStatusById', () => {
    it('should update the status of a deposit', async () => {
      const depositId = 1;
      const status = MixinDepositStatus.CONFIRMED;

      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await depositRepository.updateStatusById(
        depositId,
        status,
      );

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: depositId },
        { status },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('updateTransactionHashById', () => {
    it('should update the transaction hash of a deposit', async () => {
      const depositId = 1;
      const txHash = 'hash-123';

      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await depositRepository.updateTransactionHashById(
        depositId,
        txHash,
      );

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: depositId },
        { transactionHash: txHash },
      );
      expect(result).toEqual({ affected: 1 });
    });
  });
});
