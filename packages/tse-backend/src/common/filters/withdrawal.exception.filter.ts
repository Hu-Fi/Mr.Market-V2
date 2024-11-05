import { HttpException, HttpStatus } from '@nestjs/common';

export class ExchangeNotFoundException extends HttpException {
  constructor(exchange: string) {
    super(`Exchange ${exchange} not found`, HttpStatus.NOT_FOUND);
  }
}

export class WithdrawalNotSupportedException extends HttpException {
  constructor(exchange: string) {
    super(
      `Exchange ${exchange} does not support withdrawals`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class NetworkErrorException extends HttpException {
  constructor(exchange: string, originalError: Error) {
    super(
      `Network error while attempting withdrawal on ${exchange}: ${originalError.message}`,
      HttpStatus.GATEWAY_TIMEOUT,
    );
  }
}

export class ExchangeErrorException extends HttpException {
  constructor(exchange: string, originalError: Error) {
    super(
      `Exchange error on ${exchange}: ${originalError.message}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
