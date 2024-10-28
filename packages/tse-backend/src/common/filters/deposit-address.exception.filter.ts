import { HttpException, HttpStatus } from '@nestjs/common';

export class ExchangeNotFoundException extends HttpException {
  constructor(exchange: string) {
    super(`Exchange ${exchange} not found`, HttpStatus.NOT_FOUND);
  }
}

export class DepositAddressFetchException extends HttpException {
  constructor(exchange: string, symbol: string, originalError: Error) {
    super(
      `Failed to fetch deposit address for ${symbol} on ${exchange}: ${originalError.message}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DepositAddressCreateException extends HttpException {
  constructor(exchange: string, symbol: string, originalError: Error) {
    super(
      `Failed to create deposit address for ${symbol} on ${exchange}: ${originalError.message}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
