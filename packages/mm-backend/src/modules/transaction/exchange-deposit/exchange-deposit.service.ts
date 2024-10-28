import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CreateDepositCommand } from './model/exchange-deposit.model';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ExchangeDepositService {
  private readonly tseApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.tseApiUrl = this.configService.get<string>('TRADING_STRATEGY_EXECUTION_API');
  }

  async deposit(command: CreateDepositCommand) {
    const url = `${this.tseApiUrl}/exchange-deposit`;
    const payload = { ...command };

    try {
      return await lastValueFrom(
        this.httpService.post(url, payload).pipe(
          map((res) => res.data),
        )
      );
    } catch (error) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.message || 'Failed to process deposit request';
      throw new HttpException(message, status);
    }
  }
}
