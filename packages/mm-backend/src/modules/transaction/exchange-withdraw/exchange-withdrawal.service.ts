import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CreateWithdrawalCommand } from './model/exchange-withdrawal.model';
import { catchError, lastValueFrom, map } from 'rxjs';
import { ExchangeWithdrawalStatus } from '../../../common/enums/transaction.enum';
import { Transactional } from 'typeorm-transactional';
import { ExchangeWithdrawalRepository } from './exchange-withdrawal.repository';
import { AxiosError } from 'axios';

@Injectable()
export class ExchangeWithdrawalService {
  private readonly tseApiUrl: string;
  private readonly logger = new Logger(ExchangeWithdrawalService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly repository: ExchangeWithdrawalRepository,
  ) {
    this.tseApiUrl = this.configService.get<string>(
      'TRADING_STRATEGY_EXECUTION_URL',
    );
  }

  @Transactional()
  async withdraw(command: CreateWithdrawalCommand) {
    const url = `${this.tseApiUrl}/api/v1/exchange-withdrawal`;
    const payload = { ...command };

    const withdrawal = await this.repository.save({
      userId: command.userId,
      exchangeName: command.exchangeName,
      assetId: command.symbol,
      destination: command.address,
      amount: command.amount,
      status: ExchangeWithdrawalStatus.PENDING,
    });

    let transactionDetails: { id: string; };
    try {
      transactionDetails = await lastValueFrom(
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

    await this.repository.updateTransactionHashById(
      withdrawal.id,
      transactionDetails.id,
    );

    return transactionDetails.id;
  }

  async getWithdrawal(exchangeName: string, transactionHash: string) {
    const query = `?exchangeName=${exchangeName}&transactionHash=${transactionHash}}`;
    const url = `${this.tseApiUrl}/api/v1/exchange-withdrawal${query}`;
    return await lastValueFrom(
      this.httpService.get(url).pipe(map((res) => res.data)),
    );
  }

  async getPendingWithdrawals() {
    return this.repository.findWithdrawalsByStatus(
      ExchangeWithdrawalStatus.PENDING,
    );
  }

  async updateWithdrawalStatus(id: number, status: ExchangeWithdrawalStatus) {
    await this.repository.updateStatusById(id, status);
  }
}
