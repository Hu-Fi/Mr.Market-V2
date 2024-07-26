import { Test, TestingModule } from '@nestjs/testing';
import { HttpAdapterHost } from '@nestjs/core';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let httpAdapterHost: HttpAdapterHost;

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
    httpAdapterHost = module.get<HttpAdapterHost>(HttpAdapterHost);
  });

  it('should handle HttpException', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const mockResponse = {};
    const mockRequest = {};
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(mockRequest);
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        timestamp: expect.any(String),
        path: '/test-url',
      },
      HttpStatus.FORBIDDEN,
    );
  });

  it('should handle unknown exceptions', () => {
    const exception = new Error('Unknown error');
    const mockResponse = {};
    const mockRequest = {};
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(mockRequest);
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unknown error',
        timestamp: expect.any(String),
        path: '/test-url',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should handle exceptions that are not instances of Error', () => {
    const exception = { message: 'Not an instance of Error' };
    const mockResponse = {};
    const mockRequest = {};
    const host = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);

    expect(mockHttpAdapter.getRequestUrl).toHaveBeenCalledWith(mockRequest);
    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      mockResponse,
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unknown error',
        timestamp: expect.any(String),
        path: '/test-url',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
