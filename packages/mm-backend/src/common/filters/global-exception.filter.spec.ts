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

  afterEach(() => jest.clearAllMocks());

  it('should handle HttpException and log the error', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const mockGetResponse = jest.fn();
    const mockGetRequest = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(
      mockGetRequest(),
    );
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockGetResponse(),
      {
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: expect.any(String),
        path: '/test-url',
        errors: [{ message: 'Forbidden' }],
      },
      HttpStatus.FORBIDDEN,
    );

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Error 403: [{"message":"Forbidden"}]',
      expect.any(String),
    );
  });

  it('should handle unknown exceptions and log the error', () => {
    const exception = new Error('Unknown error');
    const mockGetResponse = jest.fn();
    const mockGetRequest = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(
      mockGetRequest(),
    );
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockGetResponse(),
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-url',
        errors: [{ message: 'Unknown error' }],
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Error 500: [{"message":"Unknown error"}]',
      expect.any(String),
    );
  });

  it('should handle generic exceptions properly', () => {
    const exception = 'Some unexpected string';
    const mockGetResponse = jest.fn();
    const mockGetRequest = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(
      mockGetRequest(),
    );
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockGetResponse(),
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-url',
        errors: [{ message: 'An unexpected error occurred' }],
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Error 500: [{"message":"An unexpected error occurred"}]',
      expect.any(String),
    );
  });

  it('should handle Axios-like exceptions properly', () => {
    const exception = {
      response: {
        data: {
          message: 'Axios specific error message',
        },
      },
    };
    const mockGetResponse = jest.fn();
    const mockGetRequest = jest.fn();
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(
      mockGetRequest(),
    );
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockGetResponse(),
      {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-url',
        errors: [{ message: 'An unexpected error occurred' }],
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Error 500: [{"message":"An unexpected error occurred"}]',
      expect.any(String),
    );
  });
});
