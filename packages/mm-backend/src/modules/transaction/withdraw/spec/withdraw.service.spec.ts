import { Test, TestingModule } from '@nestjs/testing';
import { MixinGateway } from '../../../../integrations/mixin.gateway';
import { UserBalanceService } from '../../../user-balance/user-balance.service';
import { WithdrawRepository } from '../withdraw.repository';
import { WithdrawService } from '../withdraw.service';
import { WithdrawCommand } from '../model/withdraw.model';
import { Status } from '../../../../common/enums/transaction.enum';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn((_target: any, _key: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  }),
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

describe('WithdrawService', () => {
  let service: WithdrawService;

  const mockMixinGateway = {
    handleWithdrawal: jest.fn().mockResolvedValue({
      transaction_hash: 'mockTransactionHash',
      snapshot_id: 'mockSnapshotId',
    }),
  };

  const mockWithdrawRepository = {
    save: jest.fn(),
  };

  const mockUserBalanceService = {
    updateUserBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawService,
        {
          provide: MixinGateway,
          useValue: mockMixinGateway,
        },
        {
          provide: WithdrawRepository,
          useValue: mockWithdrawRepository,
        },
        {
          provide: UserBalanceService,
          useValue: mockUserBalanceService,
        },
      ],
    }).compile();

    service = module.get<WithdrawService>(WithdrawService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call transactionRepository.save, userBalanceService.updateUserBalance, and mixinGateway.handleWithdrawal on withdraw', async () => {
    const command: WithdrawCommand = {
      userId: 'user1',
      assetId: 'asset1',
      amount: 100,
      destination: 'address1',
    };

    const result = await service.withdraw(command);

    expect(mockWithdrawRepository.save).toHaveBeenCalledWith({
      ...command,
      status: Status.PENDING,
    });

    expect(mockUserBalanceService.updateUserBalance).toHaveBeenCalledWith({
      ...command,
      amount: -command.amount,
    });

    expect(mockMixinGateway.handleWithdrawal).toHaveBeenCalledWith(command);

    expect(result).toEqual({
      transactionHash: 'mockTransactionHash',
      snapshotId: 'mockSnapshotId',
    });
  });
});
