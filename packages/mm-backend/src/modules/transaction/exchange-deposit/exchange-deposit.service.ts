import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CreateDepositCommand } from './model/exchange-deposit.model';
import { lastValueFrom, map } from 'rxjs';
import { Transactional } from 'typeorm-transactional';
import { ExchangeDepositStatus } from '../../../common/enums/transaction.enum';
import { ExchangeDepositRepository } from './exchange-deposit.repository';

@Injectable()
export class ExchangeDepositService {
  private readonly tseApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly repository: ExchangeDepositRepository,
  ) {
    this.tseApiUrl = this.configService.get<string>(
      'TRADING_STRATEGY_EXECUTION_API',
    );
  }

  @Transactional()
  async deposit(command: CreateDepositCommand) {
    const url = `${this.tseApiUrl}/exchange-deposit`;
    const payload = { ...command };

    const transaction = await lastValueFrom(
      this.httpService.post(url, payload).pipe(map((res) => res.data)),
    );

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
    const url = `${this.tseApiUrl}/exchange-deposit${query}`;
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
