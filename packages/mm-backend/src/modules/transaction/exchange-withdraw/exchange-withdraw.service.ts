import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CreateWithdrawalCommand } from './model/exchange-withdrawal.model';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ExchangeWithdrawService {
  private readonly tseApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.tseApiUrl = this.configService.get<string>('TRADING_STRATEGY_EXECUTION_API');
  }

  async withdraw(command: CreateWithdrawalCommand) {
    const url = `${this.tseApiUrl}/exchange-withdrawal`;
    const payload = { ...command };

    try {
      return await lastValueFrom(
        this.httpService.post(url, payload).pipe(
          map((res) => res.data),
        )
      );
    } catch (error) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.message || 'Failed to process withdrawal request';
      throw new HttpException(message, status);
    }
  }
}
