import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CreateDepositCommand } from './model/exchange-deposit.model';
import { catchError, lastValueFrom, map } from 'rxjs';
import { Transactional } from 'typeorm-transactional';
import { ExchangeDepositStatus } from '../../../common/enums/transaction.enum';
import { ExchangeDepositRepository } from './exchange-deposit.repository';
import { AxiosError } from 'axios';

@Injectable()
export class ExchangeDepositService {
  private readonly tseApiUrl: string;
  private readonly logger = new Logger(ExchangeDepositService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly repository: ExchangeDepositRepository,
  ) {
    this.tseApiUrl = this.configService.get<string>(
      'TRADING_STRATEGY_EXECUTION_URL',
    );
  }

  @Transactional()
  async deposit(command: CreateDepositCommand) {
    const url = `${this.tseApiUrl}/api/v1/exchange-deposit`;
    const payload = { ...command };

    let transaction: { address: string; };

    try {
      transaction = await lastValueFrom(
        this.httpService.post(url, payload).pipe(
          map((res) => res.data),
          catchError((error: AxiosError) => {
            this.logger.error(`Error response from TSE API: ${JSON.stringify(error.response?.data)}`, error.stack);

            const responseData = error.response?.data as any;
            const errors = responseData?.errors;
            const errorMessage = Array.isArray(errors) && errors.length > 0
              ? errors.map(err => err.message).join(', ')
              : error.message;

            const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

            throw new HttpException(errorMessage, status);
          }),
        ),
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException('An unexpected error occurred while processing the withdrawal.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    await this.repository.save({
      userId: command.userId,
      exchangeName: command.exchangeName,
      assetId: command.symbol,
      destination: transaction.address,
      chainId: command.network,
      amount: command.amount,
      status: ExchangeDepositStatus.PENDING,
    });

    return transaction;
  }

  async getDeposits(exchangeName: string, symbol: string) {
    const query = `?exchangeName=${exchangeName}&symbol=${symbol}`;
    const url = `${this.tseApiUrl}/api/v1/exchange-deposit${query}`;
    return await lastValueFrom(
      this.httpService.get(url).pipe(map((res) => res.data)),
    );
  }

  async getPendingDeposits() {
    return await this.repository.findByStatus(ExchangeDepositStatus.PENDING);
  }

  async updateDepositStatus(depositId: number, status: ExchangeDepositStatus) {
    await this.repository.updateStatusById(depositId, status);
  }

  async updateDepositTransactionHash(depositId: number, txHash: string) {
    await this.repository.updateTransactionHashById(depositId, txHash);
  }
}
