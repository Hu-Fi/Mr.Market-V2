import { Test, TestingModule } from '@nestjs/testing';
import { MixinDepositService } from '../mixin-deposit.service';
import { MixinDepositRepository } from '../mixin-deposit.repository';
import { MixinGateway } from '../../../../integrations/mixin.gateway';
import { DepositCommand } from '../model/mixin-deposit.model';
import { MixinDepositResponse } from '../../../../common/interfaces/transaction.interfaces';
import { MixinDeposit } from '../../../../common/entities/mixin-deposit.entity';
import { MixinDepositStatus } from '../../../../common/enums/transaction.enum';

jest.mock('typeorm-transactional', () => ({
  Transactional: () =>
    jest.fn((_target: any, _key: string, descriptor: PropertyDescriptor) => {
      return descriptor;
    }),
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

describe('DepositService', () => {
  let service: MixinDepositService;
  let mixinGateway: MixinGateway;
  let transactionRepository: MixinDepositRepository;

  const mockMixinGateway = {
    fetchTransactionDetails: jest.fn(),
    handleWithdrawal: jest.fn(),
    getUnspentTransactionOutputs: jest.fn(),
    createDepositAddress: jest.fn(),
  };

  const mockDepositRepository = {
    save: jest.fn(),
    findByStatus: jest.fn(),
    updateStatusById: jest.fn(),
    updateTransactionHashById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MixinDepositService,
        {
          provide: MixinGateway,
          useValue: mockMixinGateway,
        },
        {
          provide: MixinDepositRepository,
          useValue: mockDepositRepository,
        },
      ],
    }).compile();

    service = module.get<MixinDepositService>(MixinDepositService);
    mixinGateway = module.get<MixinGateway>(MixinGateway);
    transactionRepository = module.get<MixinDepositRepository>(
      MixinDepositRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    it('should execute a deposit transaction', async () => {
      const command: DepositCommand = {
        userId: 'user-id-123',
        amount: 100,
        assetId: 'asset-id-456',
        chainId: 'chain-id-789',
      };

      const destination = 'destination-address';
      const depositResponse: MixinDepositResponse = {
        assetId: command.assetId,
        amount: command.amount,
        destination: destination,
      };

      mockMixinGateway.createDepositAddress.mockResolvedValue(destination);
      mockDepositRepository.save.mockResolvedValue(depositResponse);

      const result = await service.deposit(command);

      expect(mixinGateway.createDepositAddress).toHaveBeenCalledWith(command);
      expect(transactionRepository.save).toHaveBeenCalledWith({
        ...command,
        status: MixinDepositStatus.PENDING,
        destination,
      });
      expect(result).toEqual(depositResponse);
    });
  });

  describe('getPendingDeposits', () => {
    it('should return pending deposits', async () => {
      const pendingDeposits: MixinDeposit[] = [
        {
          id: 1,
          userId: 'user-id-123',
          amount: 100,
          assetId: 'asset-id-456',
          chainId: 'chain-id-789',
          status: MixinDepositStatus.PENDING,
          transactionHash: 'transaction-hash',
          destination: 'destination-address',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDepositRepository.findByStatus.mockResolvedValue(pendingDeposits);

      const result = await service.getPendingDeposits();

      expect(transactionRepository.findByStatus).toHaveBeenCalledWith(
        MixinDepositStatus.PENDING,
      );
      expect(result).toEqual(pendingDeposits);
    });
  });

  describe('updateDepositStatus', () => {
    it('should update the deposit status', async () => {
      const depositId = 1;
      const status = MixinDepositStatus.CONFIRMED;

      await service.updateDepositStatus(depositId, status);

      expect(transactionRepository.updateStatusById).toHaveBeenCalledWith(
        depositId,
        status,
      );
    });
  });

  describe('updateDepositTransactionHash', () => {
    it('should update the transaction hash of a deposit', async () => {
      const depositId = 1;
      const txHash = 'new-transaction-hash';

      await service.updateDepositTransactionHash(depositId, txHash);

      expect(
        transactionRepository.updateTransactionHashById,
      ).toHaveBeenCalledWith(depositId, txHash);
    });
  });
});
