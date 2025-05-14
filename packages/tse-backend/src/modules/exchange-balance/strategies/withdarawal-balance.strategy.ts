import { Injectable } from '@nestjs/common';
import { ExchangeWithdrawalService } from '../../exchange-withdrawal/exchange-withdrawal.service';
import { ExchangeBalanceCommand } from '../model/exchange-balance.model';
import { BalanceStrategy } from '../../../common/interfaces/exchange-data.interfaces';
import { TransactionType } from '../../../common/enums/exchange-data.enums';

@Injectable()
export class WithdrawalBalanceStrategy implements BalanceStrategy {
  readonly type = TransactionType.WITHDRAWAL;

  constructor(private readonly withdrawalService: ExchangeWithdrawalService) {}

  async getPersisted(command: ExchangeBalanceCommand) {
    return this.withdrawalService.getPersistedUserSuccessfullyWithdrawalData(
      command,
    );
  }

  async fetchAndPersist(
    command: ExchangeBalanceCommand,
    lastTimestamp?: string,
  ) {
    const fetched = await this.withdrawalService.fetchWithdrawals(
      command.exchangeName,
      command.network,
      command.symbol,
      command.userId,
      lastTimestamp,
    );
    if (fetched.length > 0) {
      await this.withdrawalService.persistInDatabaseUserSuccessfullyWithdrawal(
        fetched,
      );
    }
    return fetched;
  }
}
