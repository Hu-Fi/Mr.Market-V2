import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ExchangeWithdrawService } from '../exchange-withdraw.service';
import { CreateWithdrawalCommand } from '../model/exchange-withdrawal.model';

describe('ExchangeWithdrawService', () => {
  let service: ExchangeWithdrawService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeWithdrawService,
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
      ],
    }).compile();

    service = module.get<ExchangeWithdrawService>(ExchangeWithdrawService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the correct URL and payload when withdrawing', async () => {
    const command: CreateWithdrawalCommand = {
      exchangeName: 'Binance',
      symbol: 'BTC',
      network: 'BTC',
      address: 'mock-address',
      tag: 'mock-tag',
      amount: 0.1,
    };
    const response: AxiosResponse = {
      config: undefined,
      data: { status: 'success' },
      status: 200,
      statusText: 'OK',
      headers: {}
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(response));

    const result = await service.withdraw(command);
    expect(result).toEqual(response.data);
    expect(httpService.post).toHaveBeenCalledWith(
      'http://mock-tse-api-url/exchange-withdrawal',
      command,
    );
  });

  it('should throw HttpException when HttpService returns an error', async () => {
    const command: CreateWithdrawalCommand = {
      exchangeName: 'Binance',
      symbol: 'BTC',
      network: 'BTC',
      address: 'mock-address',
      tag: 'mock-tag',
      amount: 0.1,
    };
    const errorResponse = {
      response: {
        status: HttpStatus.BAD_REQUEST,
        data: { message: 'Invalid withdrawal request' },
      },
    };

    jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => errorResponse));

    await expect(service.withdraw(command)).rejects.toThrow(
      new HttpException('Invalid withdrawal request', HttpStatus.BAD_REQUEST),
    );
  });

  it('should throw internal server error when error response is missing status', async () => {
    const command: CreateWithdrawalCommand = {
      exchangeName: 'Binance',
      symbol: 'BTC',
      network: 'BTC',
      address: 'mock-address',
      tag: 'mock-tag',
      amount: 0.1,
    };
    const errorResponse = { response: {} };

    jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => errorResponse));

    await expect(service.withdraw(command)).rejects.toThrow(
      new HttpException('Failed to process withdrawal request', HttpStatus.INTERNAL_SERVER_ERROR),
    );
  });

  it('should use the correct API URL from config', () => {
    expect(configService.get).toHaveBeenCalledWith('TRADING_STRATEGY_EXECUTION_API');
  });
});
