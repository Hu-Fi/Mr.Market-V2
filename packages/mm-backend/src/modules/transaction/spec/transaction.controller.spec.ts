import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../transaction.controller';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { TransactionProfile } from '../transaction.mapper';
import { MixinDepositService } from '../mixin-deposit/mixin-deposit.service';
import {
  DepositCommand,
  DepositDto,
} from '../mixin-deposit/model/mixin-deposit.model';
import { MixinDepositResponse } from '../../../common/interfaces/transaction.interfaces';
import { MixinWithdrawalService } from '../mixin-withdraw/mixin-withdrawal.service';
import {
  WithdrawCommand,
  WithdrawDto,
} from '../mixin-withdraw/model/mixin-withdrawal.model';
import { CreateWithdrawalDto } from '../exchange-withdraw/model/exchange-withdrawal.model';
import { CreateDepositDto } from '../exchange-deposit/model/exchange-deposit.model';
import { ExchangeDepositService } from '../exchange-deposit/exchange-deposit.service';
import { ExchangeWithdrawalService } from '../exchange-withdraw/exchange-withdrawal.service';
import { ExchangeNetwork } from '../../../common/enums/exchange.enum';

describe('TransactionController', () => {
  let controller: TransactionController;

  const mockDepositService = {
    deposit: jest.fn(),
  };
  const mockWithdrawService = {
    withdraw: jest.fn(),
  };
  const mockExchangeDepositService = {
    deposit: jest.fn(),
  };
  const mockExchangeWithdrawService = {
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
          provide: MixinDepositService,
          useValue: mockDepositService,
        },
        {
          provide: MixinWithdrawalService,
          useValue: mockWithdrawService,
        },
        {
          provide: ExchangeDepositService,
          useValue: mockExchangeDepositService,
        },
        {
          provide: ExchangeWithdrawalService,
          useValue: mockExchangeWithdrawService,
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
      const depositResponse: MixinDepositResponse = {
        assetId: depositDto.assetId,
        amount: depositDto.amount,
        destination: 'some-destination',
      };

      mockDepositService.deposit.mockResolvedValue(depositResponse);

      const req = { user: { userId } };
      const result = await controller.mixinDeposit(depositDto, req);

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

      const result = await controller.mixinWithdraw(withdrawDto, req);

      expect(mockWithdrawService.withdraw).toHaveBeenCalledWith(command);
      expect(result).toEqual(withdrawResponse);
    });
  });

  describe('exchangeDeposit', () => {
    it('should execute an exchange deposit transaction', async () => {
      const createDepositDto: CreateDepositDto = {
        exchangeName: 'Binance',
        symbol: 'BTC',
        network: ExchangeNetwork.ERC20,
        amount: 0.001,
      };

      const depositResponse = {
        exchangeName: createDepositDto.exchangeName,
        symbol: createDepositDto.symbol,
        network: createDepositDto.network,
        destination: 'exchange-destination',
      };

      mockExchangeDepositService.deposit.mockResolvedValue(depositResponse);

      const userId = 'user-id-123';
      const req = { user: { userId } };

      const result = await controller.exchangeDeposit(createDepositDto, req);

      expect(mockExchangeDepositService.deposit).toHaveBeenCalledWith(
        expect.objectContaining(createDepositDto),
      );
      expect(result).toEqual(depositResponse);
    });
  });

  describe('exchangeWithdraw', () => {
    it('should execute an exchange withdraw transaction', async () => {
      const createWithdrawalDto: CreateWithdrawalDto = {
        exchangeName: 'Binance',
        symbol: 'BTC',
        network: 'BTC',
        address: 'some-address',
        tag: 'some-tag',
        amount: 0.01,
      };

      const withdrawResponse = {
        transactionHash: 'exchangeTransactionHash',
        snapshotId: 'exchangeSnapshotId',
      };

      mockExchangeWithdrawService.withdraw.mockResolvedValue(withdrawResponse);

      const userId = 'user-id-123';
      const req = { user: { userId } };

      const result = await controller.exchangeWithdraw(
        createWithdrawalDto,
        req,
      );

      expect(mockExchangeWithdrawService.withdraw).toHaveBeenCalledWith(
        expect.objectContaining(createWithdrawalDto),
      );
      expect(result).toEqual(withdrawResponse);
    });
  });
});
