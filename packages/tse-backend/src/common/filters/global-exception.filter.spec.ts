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
        },
        HttpStatus.FORBIDDEN,
    );
  });

  it('should handle unknown exceptions', () => {
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
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
