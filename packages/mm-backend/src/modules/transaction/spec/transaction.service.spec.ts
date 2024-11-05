import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TransactionService } from '../transaction.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { DepositService } from '../mixin-deposit/deposit.service';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { SchedulerUtil } from '../../../common/utils/scheduler.utils';
import { mockDeposits } from './transaction.fixtures';
import { WithdrawService } from '../mixin-withdraw/withdraw.service';
import { UserBalanceService } from '../../user-balance/user-balance.service';
import {
  MixinDepositStatus,
  MixinWithdrawalStatus,
} from '../../../common/enums/transaction.enum';

const mockDepositService = {
  getPendingDeposits: jest.fn(),
  updateDepositStatus: jest.fn(),
  updateDepositTransactionHash: jest.fn(),
};

const mockWithdrawService = {
  getSignedWithdrawals: jest.fn().mockResolvedValue([]),
  updateWithdrawalStatus: jest.fn(),
  updateWithdrawalTransactionHash: jest.fn(),
};

const mockMixinGateway = {
  fetchTransactionDetails: jest.fn(),
  handleWithdrawal: jest.fn(),
  getUnspentTransactionOutputs: jest.fn(),
  createDepositAddress: jest.fn(),
};

const mockSchedulerUtils = {
  addCronJob: jest.fn(),
};

const mockUserBalanceService = {
  findOrCreateUserBalance: jest.fn(),
  updateUserBalance: jest.fn(),
};

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: DepositService, useValue: mockDepositService },
        { provide: WithdrawService, useValue: mockWithdrawService },
        { provide: MixinGateway, useValue: mockMixinGateway },
        { provide: SchedulerRegistry, useValue: {} },
        { provide: SchedulerUtil, useValue: mockSchedulerUtils },
        { provide: UserBalanceService, useValue: mockUserBalanceService },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(transactionService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should add a cron job for processing transactions', () => {
      transactionService.onModuleInit();
      expect(mockSchedulerUtils.addCronJob).toHaveBeenCalledWith(
        TransactionService.name,
        expect.any(String),
        expect.any(Function),
        schedulerRegistry,
      );
    });
  });

  describe('handleCron', () => {
    it('should skip processing if the job is already running', async () => {
      (transactionService as any).isJobRunning = true;
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      await transactionService.handleCron();

      expect(loggerSpy).toHaveBeenCalledWith('Job still running, skipping');
      expect(mockDepositService.getPendingDeposits).not.toHaveBeenCalled();
    });

    it('should process data when job is not running', async () => {
      (transactionService as any).isJobRunning = false;
      mockDepositService.getPendingDeposits.mockResolvedValue(mockDeposits);

      await transactionService.handleCron();

      expect(mockDepositService.getPendingDeposits).toHaveBeenCalled();
    });
  });

  describe('processDeposits', () => {
    it('should process deposits successfully when outputs and pending deposits exist', async () => {
      const mockOutputs = [
        {
          asset_id: 'asset-123',
          amount: '100',
          created_at: '2024-09-25T14:00:00.000Z',
          transaction_hash: 'transaction-hash-1',
        },
      ];
      mockMixinGateway.getUnspentTransactionOutputs.mockResolvedValue(
        mockOutputs,
      );
      mockDepositService.getPendingDeposits.mockResolvedValue(mockDeposits);

      await transactionService.processMixinDeposits();

      expect(mockDepositService.getPendingDeposits).toHaveBeenCalled();
      expect(mockUserBalanceService.updateUserBalance).toHaveBeenCalledWith({
        userId: mockDeposits[0].userId,
        assetId: mockDeposits[0].assetId,
        amount: mockDeposits[0].amount,
      });
      expect(mockDepositService.updateDepositStatus).toHaveBeenCalledWith(
        mockDeposits[0].id,
        MixinDepositStatus.CONFIRMED,
      );
      expect(
        mockDepositService.updateDepositTransactionHash,
      ).toHaveBeenCalledWith(
        mockDeposits[0].id,
        mockOutputs[0].transaction_hash,
      );
    });

    it('should not process deposits if there are no pending deposits', async () => {
      mockMixinGateway.getUnspentTransactionOutputs.mockResolvedValue([]);
      mockDepositService.getPendingDeposits.mockResolvedValue([]);

      await transactionService.processMixinDeposits();

      expect(mockDepositService.getPendingDeposits).toHaveBeenCalled();
      expect(mockUserBalanceService.updateUserBalance).not.toHaveBeenCalled();
      expect(mockDepositService.updateDepositStatus).not.toHaveBeenCalled();
      expect(
        mockDepositService.updateDepositTransactionHash,
      ).not.toHaveBeenCalled();
    });

    it('should not process deposits if there are no outputs', async () => {
      mockMixinGateway.getUnspentTransactionOutputs.mockResolvedValue([]);
      mockDepositService.getPendingDeposits.mockResolvedValue(mockDeposits);

      await transactionService.processMixinDeposits();

      expect(mockDepositService.getPendingDeposits).toHaveBeenCalled();
      expect(mockUserBalanceService.updateUserBalance).not.toHaveBeenCalled();
      expect(mockDepositService.updateDepositStatus).not.toHaveBeenCalled();
      expect(
        mockDepositService.updateDepositTransactionHash,
      ).not.toHaveBeenCalled();
    });
  });

  describe('processWithdrawals', () => {
    it('should update withdrawal status to SPENT for confirmed withdrawals', async () => {
      const withdrawal = {
        transactionHash: 'tx_hash_1',
        id: 'withdrawal_id_1',
        amount: 100,
        userId: 'user_id_1',
        assetId: 'asset_id_1',
      };
      mockWithdrawService.getSignedWithdrawals.mockResolvedValue([withdrawal]);
      mockMixinGateway.fetchTransactionDetails.mockResolvedValue({
        state: MixinWithdrawalStatus.SPENT,
      });

      await transactionService.processMixinWithdrawals();

      expect(mockWithdrawService.getSignedWithdrawals).toHaveBeenCalled();
      expect(mockMixinGateway.fetchTransactionDetails).toHaveBeenCalledWith(
        withdrawal.transactionHash,
      );
      expect(mockWithdrawService.updateWithdrawalStatus).toHaveBeenCalledWith(
        withdrawal.id,
        MixinWithdrawalStatus.SPENT,
      );
      expect(mockUserBalanceService.updateUserBalance).toHaveBeenCalledWith({
        userId: withdrawal.userId,
        amount: -Number(withdrawal.amount),
        assetId: withdrawal.assetId,
      });
    });

    it('should not update withdrawal status if transaction is not SPENT', async () => {
      const withdrawal = {
        transactionHash: 'tx_hash_2',
        id: 'withdrawal_id_2',
      };
      mockWithdrawService.getSignedWithdrawals.mockResolvedValue([withdrawal]);
      mockMixinGateway.fetchTransactionDetails.mockResolvedValue({
        state: 'SIGNED',
      });

      await transactionService.processMixinWithdrawals();

      expect(mockWithdrawService.getSignedWithdrawals).toHaveBeenCalled();
      expect(mockMixinGateway.fetchTransactionDetails).toHaveBeenCalledWith(
        withdrawal.transactionHash,
      );
      expect(mockWithdrawService.updateWithdrawalStatus).not.toHaveBeenCalled();
    });
  });
});
