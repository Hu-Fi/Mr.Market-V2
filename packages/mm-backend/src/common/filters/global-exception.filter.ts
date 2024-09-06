import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus, Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: this.getErrorMessage(exception),
    };

    this.logError(exception, responseBody);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message;
    }
    if (exception instanceof Error) {
      return exception.message || 'An unknown error occurred';
    }
    return 'An unexpected error occurred';
  }

  private logError(exception: unknown, responseBody: any): void {
    if (exception instanceof HttpException) {
      this.logger.error(
        `Http Status: ${responseBody.statusCode}, Error Message: ${responseBody.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Non-Http Exception: ${responseBody.message}`,
        exception instanceof Error ? exception.stack : '',
      );
    }
  }
}
