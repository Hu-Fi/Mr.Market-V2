import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TseHealthService {
  TRADING_STRATEGY_EXECUTION_API: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.TRADING_STRATEGY_EXECUTION_API = this.configService.get<string>(
      'TRADING_STRATEGY_EXECUTION_API',
    );
  }
  async checkDbHealth() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.TRADING_STRATEGY_EXECUTION_API}/health`),
      );
      return response.data;
    } catch {
      throw new Error('Failed to check trading strategy execution health');
    }
  }
}
