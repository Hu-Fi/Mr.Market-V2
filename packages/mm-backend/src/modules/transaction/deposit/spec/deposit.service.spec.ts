import { Test, TestingModule } from '@nestjs/testing';
import { DepositService } from '../deposit.service';
import { DepositRepository } from '../deposit.repository';
import { MixinGateway } from '../../../../integrations/mixin.gateway';
import { UserBalanceService } from '../../../user-balance/user-balance.service';
import { DepositCommand } from '../model/deposit.model';
import { DepositResponse } from '../../../../common/interfaces/transaction.interfaces';
import { Status } from '../../../../common/enums/transaction.enum';
import { Deposit } from '../../../../common/entities/deposit.entity';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn((_target: any, _key: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  }),
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

describe('DepositService', () => {
  let service: DepositService;
  let mixinGateway: MixinGateway;
  let transactionRepository: DepositRepository;
  let userBalanceService: UserBalanceService;

  const mockMixinGateway = {
    getDepositAddress: jest.fn(),
  };

  const mockTransactionRepository = {
    save: jest.fn(),
    getByStatus: jest.fn(),
    update: jest.fn(),
  };

  const mockUserBalanceService = {
    updateUserBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositService,
        {
          provide: MixinGateway,
          useValue: mockMixinGateway,
        },
        {
          provide: DepositRepository,
          useValue: mockTransactionRepository,
        },
        {
          provide: UserBalanceService,
          useValue: mockUserBalanceService,
        },
      ],
    }).compile();

    service = module.get<DepositService>(DepositService);
    mixinGateway = module.get<MixinGateway>(MixinGateway);
    transactionRepository = module.get<DepositRepository>(DepositRepository);
    userBalanceService = module.get<UserBalanceService>(UserBalanceService);
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
      const depositResponse: DepositResponse = {
        assetId: command.assetId,
        amount: command.amount,
        destination: destination,
      };

      mockMixinGateway.getDepositAddress.mockResolvedValue(destination);
      mockTransactionRepository.save.mockResolvedValue(depositResponse);

      const result = await service.deposit(command);

      expect(mixinGateway.getDepositAddress).toHaveBeenCalledWith(command);
      expect(transactionRepository.save).toHaveBeenCalledWith({
        ...command,
        status: Status.PENDING,
        destination,
      });
      expect(userBalanceService.updateUserBalance).toHaveBeenCalledWith(command);
      expect(result).toEqual(depositResponse);
    });
  });

  describe('getPendingDeposits', () => {
    it('should return pending deposits', async () => {
      const pendingDeposits: Deposit[] = [
        {
          id: 1,
          userId: 'user-id-123',
          amount: 100,
          assetId: 'asset-id-456',
          chainId: 'chain-id-789',
          status: Status.PENDING,
          destination: 'destination-address',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTransactionRepository.getByStatus.mockResolvedValue(pendingDeposits);

      const result = await service.getPendingDeposits();

      expect(transactionRepository.getByStatus).toHaveBeenCalledWith(Status.PENDING);
      expect(result).toEqual(pendingDeposits);
    });
  });

  describe('updateDepositStatus', () => {
    it('should update the deposit status', async () => {
      const depositId = 1;
      const status = Status.CONFIRMED;

      await service.updateDepositStatus(depositId, status);

      expect(transactionRepository.update).toHaveBeenCalledWith(depositId, status);
    });
  });
});
