import { Injectable, Logger } from '@nestjs/common';
import { CcxtGateway } from '../../integrations/ccxt.gateway';
import {
  DepositAddressCreateException,
  DepositAddressFetchException,
  ExchangeNotFoundException,
} from '../../common/filters/deposit-address.exception.filter';
import { CreateDepositCommand } from './model/exchange-deposit.model';

@Injectable()
export class ExchangeDepositService {
  private readonly logger = new Logger(ExchangeDepositService.name);

  constructor(private readonly ccxtGateway: CcxtGateway) {}

  async handleDeposit(command: CreateDepositCommand) {
    const { exchangeName, symbol, network } = command;
    const exchange = this.ccxtGateway.getExchange(exchangeName);
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
      return {
        address: depositAddress['address'],
        memo: depositAddress['tag'] || '',
      };
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

  async fetchDeposits(exchangeName: string, symbol: string) {
    const exchange = this.ccxtGateway.getExchange(exchangeName);
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
      return await exchange.fetchDeposits(symbol);
    } catch (error) {
      const interpretedError = this.ccxtGateway.interpretError(
        error,
        exchangeName,
      );
      this.logger.error(`Error fetching deposits: ${interpretedError.message}`);
      throw interpretedError;
    }
  }
}
