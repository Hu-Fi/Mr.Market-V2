import { Inject, Injectable } from '@nestjs/common';
import { ExchangeBalanceCommand } from './model/exchange-balance.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExchangeDepositService } from '../exchange-deposit/exchange-deposit.service';
import { Decimal } from 'decimal.js';
import { ExchangeDepositData, Transaction } from '../../common/interfaces/exchange-data.interfaces';

@Injectable()
export class ExchangeBalanceService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    //TODO: Consider use cache to recognise deposits per userId
    private readonly exchangeDepositService: ExchangeDepositService,
  ) {}

  async getExchangeBalance(command: ExchangeBalanceCommand): Promise<{ balance: number }> {
    const lastDeposits = await this.getLastDeposits(command);
    const fetchedDeposits = await this.fetchAndPersistNewDeposits(command, lastDeposits);

    const totalBalance = this.calculateTotalBalance(lastDeposits, fetchedDeposits);

    return {
      balance: totalBalance.toNumber(),
    };
  }

  private async getLastDeposits(command: ExchangeBalanceCommand): Promise<ExchangeDepositData[]> {
    return this.exchangeDepositService.getPersistedUserSuccessfullyDepositData({
      exchangeName: command.exchangeName,
      symbol: command.symbol,
      userId: command.userId,
      network: command.network,
    });
  }

  private async fetchAndPersistNewDeposits(
    command: ExchangeBalanceCommand,
    lastDeposits: ExchangeDepositData[],
  ): Promise<Transaction[]> {
    const lastDepositTimestamp: string | undefined =
      lastDeposits[lastDeposits.length - 1]?.txTimestamp;

    const fetchedDeposits = await this.exchangeDepositService.fetchDeposits(
      command.exchangeName,
      command.network,
      command.symbol,
      command.userId,
      lastDepositTimestamp,
    );

    if (fetchedDeposits.length > 0) {
      await this.exchangeDepositService.persistInDatabaseUserSuccessfullyDeposit(fetchedDeposits);
    }

    return fetchedDeposits;
  }

  private calculateTotalBalance(
    lastDeposits: ExchangeDepositData[],
    fetchedDeposits: Transaction[],
  ): Decimal {
    const lastDepositsBalance = this.sumExchangeDepositData(lastDeposits);
    const fetchedDepositsBalance = this.sumTransactionData(fetchedDeposits);
    return lastDepositsBalance.plus(fetchedDepositsBalance);
  }

  private sumExchangeDepositData(deposits: ExchangeDepositData[]): Decimal {
    return deposits.reduce(
      (acc, deposit) => acc.plus(deposit.amount),
      new Decimal(0),
    );
  }

  private sumTransactionData(deposits: Transaction[]): Decimal {
    return deposits.reduce(
      (acc, deposit) => acc.plus(new Decimal(deposit.amount)),
      new Decimal(0),
    );
  }
}
