import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

export class MixinApiException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly originalError?: any,
  ) {
    super(message, status);
  }
}

export class MixinUnauthorizedException extends MixinApiException {
  constructor(public readonly originalError?: any) {
    super(
      'Mixin authorization failed. The code might be invalid, expired, or already used.',
      HttpStatus.UNAUTHORIZED,
      originalError,
    );
  }
}

export class MixinApiCallFailedException extends MixinApiException {
  constructor(public readonly originalError?: any) {
    const baseMessage =
      'An unexpected error occurred during the Mixin API call.';
    const message = originalError?.message
      ? `${baseMessage} Details: ${originalError.message}`
      : baseMessage;
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, originalError);
  }
}

export function handleAndThrowMixinApiError(error: any): never {
  if (
    error instanceof BadRequestException ||
    error instanceof UnauthorizedException ||
    error instanceof InternalServerErrorException ||
    error instanceof MixinApiException
  ) {
    throw error;
  }

  const statusCode = error?.response?.status;
  const errorMessageLower = error?.message?.toLowerCase() || '';

  if (statusCode === 403 || errorMessageLower.includes('forbidden')) {
    throw new MixinUnauthorizedException(error);
  }

  throw new MixinApiCallFailedException(error);
}
