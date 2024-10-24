import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../transaction.controller';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { TransactionProfile } from '../transaction.mapper';
import { DepositService } from '../deposit/deposit.service';
import { DepositCommand, DepositDto } from '../deposit/model/deposit.model';
import { DepositResponse } from '../../../common/interfaces/transaction.interfaces';
import { WithdrawService } from '../withdraw/withdraw.service';
import { WithdrawCommand, WithdrawDto } from '../withdraw/model/withdraw.model';

describe('TransactionController', () => {
  let controller: TransactionController;

  const mockDepositService = {
    deposit: jest.fn(),
  };
  const mockWithdrawService = {
    withdraw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        {
          provide: DepositService,
          useValue: mockDepositService,
        },
        {
          provide: WithdrawService,
          useValue: mockWithdrawService,
        },
        TransactionProfile,
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deposit', () => {
    it('should execute a deposit transaction', async () => {
      const depositDto: DepositDto = {
        amount: 0.001,
        assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
        chainId: '43d61dcd-e413-450d-80b8-101d5e903357',
      };

      const userId = 'user-id-123';
      const command: DepositCommand = { userId, ...depositDto };
      const depositResponse: DepositResponse = {
        assetId: depositDto.assetId,
        amount: depositDto.amount,
        destination: 'some-destination',
      };

      mockDepositService.deposit.mockResolvedValue(depositResponse);

      const req = { user: { userId } };
      const result = await controller.deposit(depositDto, req);

      expect(mockDepositService.deposit).toHaveBeenCalledWith(command);
      expect(result).toEqual(depositResponse);
    });
  });

  describe('withdraw', () => {
    it('should execute a withdraw transaction', async () => {
      const withdrawDto: WithdrawDto = {
        amount: '0.001',
        assetId: '43d61dcd-e413-450d-80b8-101d5e903357',
        destination: 'some-destination',
      };

      const userId = 'user-id-123';
      const command: WithdrawCommand = { userId, ...withdrawDto };

      const withdrawResponse = {
        transactionHash: 'mockTransactionHash',
        snapshotId: 'mockSnapshotId',
      };

      mockWithdrawService.withdraw.mockResolvedValue(withdrawResponse);

      const req = { user: { userId } };

      const result = await controller.withdraw(withdrawDto, req);

      expect(mockWithdrawService.withdraw).toHaveBeenCalledWith(command);
      expect(result).toEqual(withdrawResponse);
    });
  });
});
