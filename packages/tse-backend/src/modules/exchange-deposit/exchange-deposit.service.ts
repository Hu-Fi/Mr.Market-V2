import { Inject, Injectable, Logger } from '@nestjs/common';
import { CcxtIntegrationService } from '../../integrations/ccxt.integration.service';
import {
  DepositAddressCreateException,
  DepositAddressFetchException,
  ExchangeNotFoundException,
} from '../../common/filters/deposit-address.exception.filter';
import { CreateDepositCommand } from './model/exchange-deposit.model';
import { ExchangeRegistryService } from '../exchange-registry/exchange-registry.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExchangeDepositRepository } from './exchange-deposit.repository';
import { Transaction } from '../../common/interfaces/exchange-data.interfaces';

@Injectable()
export class ExchangeDepositService {
  private readonly logger = new Logger(ExchangeDepositService.name);

  constructor(
    private readonly ccxtGateway: CcxtIntegrationService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly exchangeDepositRepository: ExchangeDepositRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async handleDeposit(command: CreateDepositCommand) {
    const { userId, exchangeName, symbol, network } = command;
    const exchange = await this.exchangeRegistryService.getExchangeByName({
      exchangeName,
      userId,
    });
    if (!exchange) {
      throw new ExchangeNotFoundException(exchangeName);
    }

    if (!exchange.has['fetchDepositAddress']) {
      throw new DepositAddressFetchException(
        exchangeName,
        symbol,
        new Error('fetchDepositAddress not supported'),
      );
    }

    try {
      const depositAddress = await exchange.fetchDepositAddress(symbol, {
        network,
      });

      const address = depositAddress['address'];
      const memo = depositAddress['tag'] || 'empty';

      //TODO: Consider use cache to recognise deposits per userId

      // await this.persistInCacheUserDepositMemo(
      //   userId,
      //   exchangeName,
      //   address,
      //   memo,
      // );

      return { address, memo };
    } catch (error) {
      const interpretedError = this.ccxtGateway.interpretError(
        error,
        exchangeName,
      );
      if (
        interpretedError instanceof DepositAddressFetchException &&
        exchange.has['createDepositAddress']
      ) {
        return this.createDepositAddress(exchange, symbol);
      }

      this.logger.error(
        `Error fetching deposit address: ${interpretedError.message}`,
      );
      throw interpretedError;
    }
  }

  private async createDepositAddress(exchange: any, symbol: string) {
    try {
      const createResult = await exchange.createDepositAddress(symbol);
      if (createResult) {
        this.logger.log(`Successfully created a deposit address for ${symbol}`);
        return await exchange.fetchDepositAddress(symbol);
      }
    } catch (error) {
      const interpretedError = this.ccxtGateway.interpretError(
        error,
        exchange.id,
      );
      this.logger.error(
        `Failed to create deposit address: ${interpretedError.message}`,
      );
      throw new DepositAddressCreateException(
        exchange.id,
        symbol,
        interpretedError,
      );
    }
  }

  async fetchDeposits(
    exchangeName: string,
    network: string,
    symbol: string,
    userId: string,
    txTimestamp?: string,
    ): Promise<Transaction[]> {
    const exchange = await this.exchangeRegistryService.getExchangeByName({
      exchangeName,
      userId,
    });
    if (!exchange) {
      throw new ExchangeNotFoundException(exchangeName);
    }

    if (!exchange.has['fetchDeposits']) {
      throw new DepositAddressFetchException(
        exchangeName,
        symbol,
        new Error('fetchDeposits not supported'),
      );
    }

    try {
      // return await exchange.fetchDeposits(symbol, txTimestamp, { network });
      //TODO: On Binance, when I pass the network parameter, I receive a 'Signature for this request is not valid.' error.
      return await exchange.fetchDeposits(symbol, txTimestamp);
    } catch (error) {
      const interpretedError = this.ccxtGateway.interpretError(
        error,
        exchangeName,
      );
      this.logger.error(`Error fetching deposits: ${interpretedError.message}`);
      throw interpretedError;
    }
  }

  private async persistInCacheUserDepositMemo(
    userId: string,
    exchangeName: string,
    depositAddress: string,
    memo: string,
  ) {
    const data = {
      depositAddress,
      memo,
    };

    await this.cacheManager.set(`${userId}::${exchangeName}`, JSON.stringify(data));
  }

  async persistInDatabaseUserSuccessfullyDeposit(data: any) {
    await this.exchangeDepositRepository.save(data);
  }

  async getPersistedUserSuccessfullyDepositData(data: {
    exchangeName: string;
    symbol: string;
    userId: string;
    txTimestamp?: string;
    network: string;
  }) {
    return await this.exchangeDepositRepository.get(data);
  }
}
