import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TransactionService } from '../transaction.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { DepositService } from '../deposit/deposit.service';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { SchedulerUtil } from '../../../common/utils/scheduler.utils';
import { Status } from '../../../common/enums/transaction.enum';
import { mockDeposits, mockMixinPendingDeposits } from './transaction.fixtures';

const mockDepositService = {
  getPendingDeposits: jest.fn(),
  updateDepositStatus: jest.fn(),
};

const mockMixinGateway = {
  getDepositsInProgress: jest.fn(),
};

const mockSchedulerUtils = {
  addCronJob: jest.fn(),
};

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: DepositService, useValue: mockDepositService },
        { provide: MixinGateway, useValue: mockMixinGateway },
        { provide: SchedulerRegistry, useValue: {} },
        { provide: SchedulerUtil, useValue: mockSchedulerUtils },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
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

  describe('processData', () => {
    it('should process pending deposits and update their statuses', async () => {
      mockDepositService.getPendingDeposits.mockResolvedValue(mockDeposits);
      mockMixinGateway.getDepositsInProgress.mockResolvedValue(mockMixinPendingDeposits);

      await transactionService['processData']();

      expect(mockDepositService.getPendingDeposits).toHaveBeenCalled();
      expect(mockMixinGateway.getDepositsInProgress).toHaveBeenCalledWith('asset-123');
      expect(mockDepositService.updateDepositStatus).toHaveBeenCalledWith(1, Status.CONFIRMED);
    });
  });

  describe('groupByAssetId', () => {
    it('should group deposits by assetId', () => {
      const result = transactionService['groupByAssetId'](mockDeposits);
      expect(result).toEqual({
        'asset-123': [mockDeposits[0], mockDeposits[2]],
        'asset-456': [mockDeposits[1]],
      });
    });
  });

  describe('checkAndUpdateDepositsStatus', () => {
    it('should update deposit status if found in mixin deposits', async () => {
      await transactionService['checkAndUpdateDepositsStatus'](mockDeposits, mockMixinPendingDeposits);
      expect(mockDepositService.updateDepositStatus).toHaveBeenCalledWith(1, Status.CONFIRMED);
    });
  });

  describe('compareDeposits', () => {
    it('should return true for matching deposits', () => {
      const dbDeposit = { amount: 100, createdAt: new Date() };
      const pendingDeposit = { amount: 100, created_at: new Date(), confirmations: 3, threshold: 2 };

      const result = transactionService['compareDeposits'](pendingDeposit, dbDeposit);

      expect(result).toBe(true);
    });

    it('should return false for non-matching deposits', () => {
      const dbDeposit = { amount: 100, createdAt: new Date() };
      const pendingDeposit = { amount: 50, created_at: new Date(), confirmations: 1, threshold: 2 };

      const result = transactionService['compareDeposits'](pendingDeposit, dbDeposit);

      expect(result).toBe(false);
    });
  });
});
