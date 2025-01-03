import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TseHealthService {
  TRADING_STRATEGY_EXECUTION_URL: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.TRADING_STRATEGY_EXECUTION_URL = this.configService.get<string>(
      'TRADING_STRATEGY_EXECUTION_URL',
    );
  }
  async checkDbHealth() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.TRADING_STRATEGY_EXECUTION_URL}/api/v1/health`,
        ),
      );
      return response.data;
    } catch {
      throw new Error('Failed to check trading strategy execution health');
    }
  }
}
