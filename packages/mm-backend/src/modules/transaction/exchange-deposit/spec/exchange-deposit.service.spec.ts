import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ExchangeDepositService } from '../exchange-deposit.service';
import { CreateDepositCommand } from '../model/exchange-deposit.model';
import { ExchangeDepositRepository } from '../exchange-deposit.repository';

jest.mock('typeorm-transactional', () => ({
  Transactional: () =>
    jest.fn((_target: any, _key: string, descriptor: PropertyDescriptor) => {
      return descriptor;
    }),
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

describe('ExchangeDepositService', () => {
  let service: ExchangeDepositService;
  let httpService: HttpService;

  const mockDepositRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeDepositService,
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
          provide: ExchangeDepositRepository,
          useValue: mockDepositRepository,
        },
      ],
    }).compile();

    service = module.get<ExchangeDepositService>(ExchangeDepositService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should make an HTTP request and save deposit transaction', async () => {
    const command: CreateDepositCommand = {
      userId: 'user123',
      amount: 0.05,
      symbol: 'BTC',
      network: 'BTC',
      exchangeName: 'binance',
    };
    const transaction = { address: 'deposit-address', amount: 0.05 };
    const axiosResponse: Partial<AxiosResponse> = { data: transaction };

    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of(axiosResponse as AxiosResponse));

    const result = await service.deposit(command);

    expect(httpService.post).toHaveBeenCalledWith(
      'http://mock-tse-api-url/exchange-deposit',
      command,
    );
    expect(mockDepositRepository.save).toHaveBeenCalledWith({
      userId: command.userId,
      assetId: command.symbol,
      destination: transaction.address,
      chainId: command.network,
      amount: transaction.amount,
      status: 'pending',
      exchangeName: 'binance',
    });
    expect(result).toEqual(transaction);
  });

  it('should throw an error if the HTTP request fails', async () => {
    const command: CreateDepositCommand = {
      userId: 'user123',
      amount: 1,
      symbol: 'BTC',
      network: 'BTC',
      exchangeName: 'binance',
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

    await expect(service.deposit(command)).rejects.toThrow(HttpException);
  });

  it('should throw an error if saving deposit transaction fails', async () => {
    const command: CreateDepositCommand = {
      userId: 'user123',
      amount: 1,
      symbol: 'BTC',
      network: 'BTC',
      exchangeName: 'binance',
    };
    const transaction = { address: 'deposit-address', amount: 0.05 };
    const axiosResponse: Partial<AxiosResponse> = { data: transaction };

    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of(axiosResponse as AxiosResponse));
    mockDepositRepository.save.mockRejectedValue(new Error('Repository Error'));

    await expect(service.deposit(command)).rejects.toThrow('Repository Error');
  });
});
