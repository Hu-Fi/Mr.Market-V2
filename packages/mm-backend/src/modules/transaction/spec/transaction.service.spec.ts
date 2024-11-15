import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../transaction.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { MixinGateway } from '../../../integrations/mixin.gateway';
import { SchedulerUtil } from '../../../common/utils/scheduler.utils';
import { MixinTransactionUtils } from '../utils/mixin-transaction.utils';
import { ExchangeTransactionUtils } from '../utils/exchange-transaction.utils';
import { CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

const mockMixinTransactionUtils = {
  getPendingDeposits: jest.fn(),
  getSignedWithdrawals: jest.fn(),
  findAndProcessMatchingDeposits: jest.fn(),
  updateWithdrawalStatus: jest.fn(),
  updateUserBalance: jest.fn(),
};

const mockExchangeTransactionUtils = {
  getPendingDeposits: jest.fn(),
  getDeposits: jest.fn(),
  updateDepositStatus: jest.fn(),
  updateDepositTransactionHash: jest.fn(),
  getPendingWithdrawals: jest.fn(),
  getWithdrawal: jest.fn(),
  updateWithdrawalStatus: jest.fn(),
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

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: MixinGateway, useValue: mockMixinGateway },
        { provide: SchedulerRegistry, useValue: {} },
        { provide: SchedulerUtil, useValue: mockSchedulerUtils },
        { provide: MixinTransactionUtils, useValue: mockMixinTransactionUtils },
        {
          provide: ExchangeTransactionUtils,
          useValue: mockExchangeTransactionUtils,
        },
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
        CronExpression.EVERY_5_MINUTES,
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
      expect(
        mockMixinTransactionUtils.getPendingDeposits,
      ).not.toHaveBeenCalled();
    });
  });
});
