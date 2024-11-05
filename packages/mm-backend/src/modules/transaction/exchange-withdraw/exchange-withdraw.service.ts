import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CreateWithdrawalCommand } from './model/exchange-withdrawal.model';
import { lastValueFrom, map } from 'rxjs';
import { WithdrawRepository } from '../mixin-withdraw/withdraw.repository';
import { TransactionStatus } from '../../../common/enums/transaction.enum';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class ExchangeWithdrawService {
  private readonly tseApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly repository: WithdrawRepository,
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
      assetId: command.symbol,
      destination: command.address,
      amount: Number(command.amount),
      status: TransactionStatus.PENDING,
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
}
