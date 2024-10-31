import { Test, TestingModule } from '@nestjs/testing';
import { HttpAdapterHost } from '@nestjs/core';
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  const mockHttpAdapter = {
    getRequestUrl: jest.fn().mockReturnValue('/test-url'),
    reply: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalExceptionFilter,
        {
          provide: HttpAdapterHost,
          useValue: { httpAdapter: mockHttpAdapter },
        },
      ],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);

    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle HttpException and log the error', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn(),
        getRequest: jest.fn(),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(
      host.switchToHttp().getRequest(),
    );
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      host.switchToHttp().getResponse(),
      {
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'Forbidden',
      },
      HttpStatus.FORBIDDEN,
    );

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Http Status: 403, Error Message: Forbidden',
      expect.any(String),
    );
  });

  it('should handle unknown exceptions and log the error', () => {
    const exception = new Error('Unknown error');
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn(),
        getRequest: jest.fn(),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(
      host.switchToHttp().getRequest(),
    );
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      host.switchToHttp().getResponse(),
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'Unknown error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Error: Unknown error',
      expect.any(String),
    );
  });

  it('should handle generic non-error objects as exceptions', () => {
    const exception = 'Some unexpected string';
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn(),
        getRequest: jest.fn(),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(
      host.switchToHttp().getRequest(),
    );
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      host.switchToHttp().getResponse(),
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'An unexpected error occurred',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should handle Axios error format and log the error', () => {
    const exception = {
      response: {
        data: {
          message: 'Axios specific error message',
        },
      },
    };
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn(),
        getRequest: jest.fn(),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(
      host.switchToHttp().getRequest(),
    );
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      host.switchToHttp().getResponse(),
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-url',
        message: 'Axios specific error message',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Axios Error: Axios specific error message',
      'Axios specific error message',
    );
  });
});
