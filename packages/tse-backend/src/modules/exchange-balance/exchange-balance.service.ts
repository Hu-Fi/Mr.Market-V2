import { Inject, Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { ExchangeBalanceCommand } from './model/exchange-balance.model';
import { BalanceStrategy } from '../../common/interfaces/exchange-data.interfaces';
import { TransactionType } from '../../common/enums/exchange-data.enums';

@Injectable()
export class ExchangeBalanceService {
  constructor(
    @Inject('BALANCE_STRATEGIES')
    private readonly strategies: BalanceStrategy[],
  ) {}

  async getExchangeBalance(command: ExchangeBalanceCommand): Promise<{
    depositBalance: string;
    withdrawalBalance: string;
    totalBalance: string;
  }> {
    const depositStrategy = this.getStrategy(TransactionType.DEPOSIT);
    const withdrawalStrategy = this.getStrategy(TransactionType.WITHDRAWAL);

    const depositBalance = await this.calculateBalance(
      depositStrategy,
      command,
    );
    const withdrawalBalance = await this.calculateBalance(
      withdrawalStrategy,
      command,
    );

    return {
      depositBalance: depositBalance.toString(),
      withdrawalBalance: withdrawalBalance.toString(),
      totalBalance: depositBalance.minus(withdrawalBalance).toString(),
    };
  }

  private getStrategy(type: TransactionType): BalanceStrategy {
    const strategy = this.strategies.find((s) => s.type === type);
    if (!strategy) {
      throw new Error(`Strategy for type ${type} not found`);
    }
    return strategy;
  }

  private async calculateBalance(
    strategy: BalanceStrategy,
    command: ExchangeBalanceCommand,
  ): Promise<Decimal> {
    const persisted = await strategy.getPersisted(command);
    const lastTimestamp = persisted[persisted.length - 1]?.txTimestamp;
    const fetched = await strategy.fetchAndPersist(command, lastTimestamp);

    const persistedSum = persisted.reduce(
      (acc, tx) => acc.plus(tx.amount),
      new Decimal(0),
    );
    const fetchedSum = fetched.reduce(
      (acc, tx) => acc.plus(new Decimal(tx.amount)),
      new Decimal(0),
    );

    return persistedSum.plus(fetchedSum);
  }
}
