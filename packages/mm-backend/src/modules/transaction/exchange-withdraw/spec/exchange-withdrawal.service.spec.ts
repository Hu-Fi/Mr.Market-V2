import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ExchangeWithdrawalService } from '../exchange-withdrawal.service';
import { CreateWithdrawalCommand } from '../model/exchange-withdrawal.model';
import { ExchangeWithdrawalRepository } from '../exchange-withdrawal.repository';

jest.mock('typeorm-transactional', () => ({
  Transactional: () =>
    jest.fn((_target: any, _key: string, descriptor: PropertyDescriptor) => {
      return descriptor;
    }),
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

describe('ExchangeWithdrawService', () => {
  let service: ExchangeWithdrawalService;
  let httpService: HttpService;

  const mockWithdrawRepository = {
    save: jest.fn().mockResolvedValue({ id: 1 }),
    updateTransactionHashById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeWithdrawalService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://mock-tse-api-url'),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ExchangeWithdrawalRepository,
          useValue: mockWithdrawRepository,
        },
      ],
    }).compile();

    service = module.get<ExchangeWithdrawalService>(ExchangeWithdrawalService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a withdrawal, make an HTTP request, and update transaction hash', async () => {
    const command: CreateWithdrawalCommand = {
      userId: 'user123',
      symbol: 'ETH',
      address: 'sample-address',
      amount: 0.01,
      exchangeName: 'binance',
      network: 'ETH',
      tag: '',
    };
    const transactionDetails = { id: 'transaction123' };
    const axiosResponse: Partial<AxiosResponse> = { data: transactionDetails };

    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of(axiosResponse as AxiosResponse));

    const result = await service.withdraw(command);

    expect(mockWithdrawRepository.save).toHaveBeenCalledWith({
      userId: command.userId,
      assetId: command.symbol,
      destination: command.address,
      amount: command.amount,
      status: 'pending',
      exchangeName: 'binance',
    });
    expect(httpService.post).toHaveBeenCalledWith(
      'http://mock-tse-api-url/exchange-withdrawal',
      command,
    );
    expect(
      mockWithdrawRepository.updateTransactionHashById,
    ).toHaveBeenCalledWith(1, transactionDetails.id);
    expect(result).toEqual(transactionDetails.id);
  });

  it('should throw an error if the HTTP request fails', async () => {
    const command: CreateWithdrawalCommand = {
      userId: 'user123',
      symbol: 'ETH',
      address: 'sample-address',
      amount: 0.01,
      exchangeName: 'binance',
      network: 'ETH',
      tag: '',
    };

    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(
        throwError(
          () =>
            new HttpException(
              'Service Unavailable',
              HttpStatus.SERVICE_UNAVAILABLE,
            ),
        ),
      );

    await expect(service.withdraw(command)).rejects.toThrow(HttpException);
  });

  it('should throw an error if save fails in the repository', async () => {
    const command: CreateWithdrawalCommand = {
      userId: 'user123',
      symbol: 'ETH',
      address: 'sample-address',
      amount: 0.01,
      exchangeName: 'binance',
      network: 'ETH',
      tag: '',
    };

    mockWithdrawRepository.save.mockRejectedValue(
      new Error('Repository Error'),
    );

    await expect(service.withdraw(command)).rejects.toThrow('Repository Error');
  });
});
