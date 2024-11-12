import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CreateWithdrawalCommand } from './model/exchange-withdrawal.model';
import { lastValueFrom, map } from 'rxjs';
import { ExchangeWithdrawalStatus } from '../../../common/enums/transaction.enum';
import { Transactional } from 'typeorm-transactional';
import { ExchangeWithdrawalRepository } from './exchange-withdrawal.repository';

@Injectable()
export class ExchangeWithdrawalService {
  private readonly tseApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly repository: ExchangeWithdrawalRepository,
  ) {
    this.tseApiUrl = this.configService.get<string>(
      'TRADING_STRATEGY_EXECUTION_API',
    );
  }

  @Transactional()
  async withdraw(command: CreateWithdrawalCommand) {
    const url = `${this.tseApiUrl}/exchange-withdrawal`;
    const payload = { ...command };

    const withdrawal = await this.repository.save({
      userId: command.userId,
      exchangeName: command.exchangeName,
      assetId: command.symbol,
      destination: command.address,
      amount: Number(command.amount),
      status: ExchangeWithdrawalStatus.PENDING,
    });

    const transactionDetails = await lastValueFrom(
      this.httpService.post(url, payload).pipe(map((res) => res.data)),
    );

    await this.repository.updateTransactionHashById(
      withdrawal.id,
      transactionDetails.id,
    );

    return transactionDetails.id;
  }

  async getWithdrawal(exchangeName: string, transactionHash: string) {
    const query = `?exchangeName=${exchangeName}&transactionHash=${transactionHash}}`;
    const url = `${this.tseApiUrl}/exchange-withdrawal${query}`;
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
