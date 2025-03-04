import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationError } from 'class-validator';

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
      success: false,
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      errors: this.getErrorDetails(exception),
    };

    this.logError(exception, responseBody);
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getErrorDetails(exception: unknown): Array<{
    field?: string;
    message: string
  }> {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (Array.isArray(response['message']) && this.isValidationError(response)) {
        return response['message'].map((err: ValidationError) => ({
          field: err.property,
          message: Object.values(err.constraints || {})[0] || 'Invalid value'
        }));
      }

      return [{ message: response['message'] || exception.message }];
    }

    if (exception instanceof Error) {
      return [{ message: exception.message }];
    }

    return [{ message: 'An unexpected error occurred' }];
  }

  private isValidationError(response: any): boolean {
    return (
      response.statusCode === HttpStatus.BAD_REQUEST &&
      Array.isArray(response.message) &&
      response.message.every(item => item instanceof ValidationError)
    );
  }

  private logError(exception: unknown, responseBody: any): void {
    const errorMessage = exception instanceof Error
      ? exception.stack
      : JSON.stringify(exception);

    this.logger.error(
      `Error ${responseBody.statusCode}: ${JSON.stringify(responseBody.errors)}`,
      errorMessage
    );
  }
}
