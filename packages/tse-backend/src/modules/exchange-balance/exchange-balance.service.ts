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
    balances: Record<
      string,
      {
        depositBalance: string;
        withdrawalBalance: string;
        totalBalance: string;
      }
    >;
  }> {
    const depositStrategy = this.getStrategy(TransactionType.DEPOSIT);
    const withdrawalStrategy = this.getStrategy(TransactionType.WITHDRAWAL);

    const depositMap = await this.calculateBalanceBySymbol(
      depositStrategy,
      command,
    );
    const withdrawalMap = await this.calculateBalanceBySymbol(
      withdrawalStrategy,
      command,
    );

    const allSymbols = new Set([
      ...Object.keys(depositMap),
      ...Object.keys(withdrawalMap),
    ]);

    const balances: Record<string, any> = {};

    for (const symbol of allSymbols) {
      const deposit = depositMap[symbol] || new Decimal(0);
      const withdrawal = withdrawalMap[symbol] || new Decimal(0);

      balances[symbol] = {
        depositBalance: deposit.toString(),
        withdrawalBalance: withdrawal.toString(),
        totalBalance: deposit.minus(withdrawal).toString(),
      };
    }

    return { balances };
  }

  private async calculateBalanceBySymbol(
    strategy: BalanceStrategy,
    command: ExchangeBalanceCommand,
  ): Promise<Record<string, Decimal>> {
    const persisted = await strategy.getPersisted(command);
    const lastTimestamps: Record<string, string | undefined> = {};

    for (const tx of persisted) {
      const current = lastTimestamps[tx.symbol];
      if (!current || tx.txTimestamp > current) {
        lastTimestamps[tx.symbol] = tx.txTimestamp;
      }
    }

    const fetched: { symbol: string; amount: number }[] = [];
    for (const symbol in lastTimestamps) {
      const symbolCommand = { ...command, symbol };
      const newFetched = await strategy.fetchAndPersist(
        symbolCommand,
        lastTimestamps[symbol],
      );
      fetched.push(...newFetched.map((f) => ({ symbol, amount: f.amount })));
    }

    const allTxs = [
      ...persisted.map((tx) => ({ symbol: tx.symbol, amount: tx.amount })),
      ...fetched.map((tx) => ({
        symbol: tx.symbol,
        amount: new Decimal(tx.amount),
      })),
    ];

    const balanceMap: Record<string, Decimal> = {};

    for (const { symbol, amount } of allTxs) {
      if (!balanceMap[symbol]) {
        balanceMap[symbol] = new Decimal(0);
      }
      balanceMap[symbol] = balanceMap[symbol].plus(amount);
    }

    return balanceMap;
  }

  private getStrategy(type: TransactionType): BalanceStrategy {
    const strategy = this.strategies.find((s) => s.type === type);
    if (!strategy) {
      throw new Error(`Strategy for type ${type} not found`);
    }
    return strategy;
  }
}
