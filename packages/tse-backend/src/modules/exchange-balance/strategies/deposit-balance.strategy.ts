import { Injectable } from '@nestjs/common';
import { ExchangeDepositService } from '../../exchange-deposit/exchange-deposit.service';
import { ExchangeBalanceCommand } from '../model/exchange-balance.model';
import { BalanceStrategy } from '../../../common/interfaces/exchange-data.interfaces';
import { TransactionType } from '../../../common/enums/exchange-data.enums';

@Injectable()
export class DepositBalanceStrategy implements BalanceStrategy {
  readonly type = TransactionType.DEPOSIT;

  constructor(private readonly depositService: ExchangeDepositService) {}

  async getPersisted(command: ExchangeBalanceCommand) {
    return this.depositService.getPersistedUserSuccessfullyDepositData(command);
  }

  async fetchAndPersist(
    command: ExchangeBalanceCommand,
    lastTimestamp?: string,
  ) {
    const fetched = await this.depositService.fetchDeposits(
      command.exchangeName,
      command.network,
      command.symbol,
      command.userId,
      lastTimestamp,
    );
    if (fetched.length > 0) {
      await this.depositService.persistInDatabaseUserSuccessfullyDeposit(
        fetched,
      );
    }
    return fetched;
  }
}
