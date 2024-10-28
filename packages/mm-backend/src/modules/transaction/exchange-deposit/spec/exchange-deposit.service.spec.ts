import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ExchangeDepositService } from '../exchange-deposit.service';
import { CreateDepositCommand } from '../model/exchange-deposit.model';

describe('ExchangeDepositService', () => {
  let service: ExchangeDepositService;
  let httpService: HttpService;
  let configService: ConfigService;

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
      ],
    }).compile();

    service = module.get<ExchangeDepositService>(ExchangeDepositService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call the correct URL and payload when depositing', async () => {
    const command: CreateDepositCommand = {
      exchangeName: 'Binance',
      symbol: 'BTC',
      network: 'BTC',
    };
    const response: AxiosResponse = {
      data: { status: 'success' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: undefined,
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(response));

    const result = await service.deposit(command);
    expect(result).toEqual(response.data);
    expect(httpService.post).toHaveBeenCalledWith(
      'http://mock-tse-api-url/exchange-deposit',
      command,
    );
  });

  it('should throw HttpException when HttpService returns an error', async () => {
    const command: CreateDepositCommand = {
      exchangeName: 'Binance',
      symbol: 'BTC',
      network: 'BTC',
    };
    const errorResponse = {
      response: {
        status: HttpStatus.BAD_REQUEST,
        data: { message: 'Invalid deposit request' },
      },
    };

    jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => errorResponse));

    await expect(service.deposit(command)).rejects.toThrow(
      new HttpException('Invalid deposit request', HttpStatus.BAD_REQUEST),
    );
  });

  it('should throw internal server error when error response is missing status', async () => {
    const command: CreateDepositCommand = {
      exchangeName: 'Binance',
      symbol: 'BTC',
      network: 'BTC',
    };
    const errorResponse = { response: {} };

    jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => errorResponse));

    await expect(service.deposit(command)).rejects.toThrow(
      new HttpException('Failed to process deposit request', HttpStatus.INTERNAL_SERVER_ERROR),
    );
  });

  it('should use the correct API URL from config', () => {
    expect(configService.get).toHaveBeenCalledWith('TRADING_STRATEGY_EXECUTION_API');
  });
});
