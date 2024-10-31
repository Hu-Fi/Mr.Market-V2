import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CreateDepositCommand } from './model/exchange-deposit.model';
import { lastValueFrom, map } from 'rxjs';
import { Transactional } from 'typeorm-transactional';
import { DepositRepository } from '../mixin-deposit/deposit.repository';
import { TransactionStatus } from '../../../common/enums/transaction.enum';

@Injectable()
export class ExchangeDepositService {
  private readonly tseApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly repository: DepositRepository,
  ) {
    this.tseApiUrl = this.configService.get<string>('TRADING_STRATEGY_EXECUTION_API');
  }

  @Transactional()
  async deposit(command: CreateDepositCommand) {
    const url = `${this.tseApiUrl}/exchange-deposit`;
    const payload = { ...command };

    const transaction = await lastValueFrom(
      this.httpService.post(url, payload).pipe(
        map((res) => res.data),
      )
    );

    await this.repository.save({
      userId: command.userId,
      assetId: command.symbol,
      destination: transaction.address,
      chainId: command.network,
      amount: transaction.amount,
      status: TransactionStatus.PENDING,
    })

    return transaction;
  }
}
