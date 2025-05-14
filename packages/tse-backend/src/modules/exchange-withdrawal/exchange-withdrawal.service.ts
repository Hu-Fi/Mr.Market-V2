import { Injectable, Logger } from '@nestjs/common';
import { CcxtIntegrationService } from '../../integrations/ccxt.integration.service';
import {
  ExchangeNotFoundException,
  WithdrawalNotSupportedException,
} from '../../common/filters/withdrawal.exception.filter';
import { CreateWithdrawalCommand } from './model/exchange-withdrawal.model';
import { ExchangeRegistryService } from '../exchange-registry/exchange-registry.service';
import { ExchangeWithdrawalRepository } from './exchange-withdrawal.repository';

@Injectable()
export class ExchangeWithdrawalService {
  private readonly logger = new Logger(ExchangeWithdrawalService.name);

  constructor(
    private readonly ccxtGateway: CcxtIntegrationService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly exchangeWithdrawalRepository: ExchangeWithdrawalRepository,
  ) {}

  async handleWithdrawal(command: CreateWithdrawalCommand) {
    const { exchangeName, symbol, network, address, tag, amount } = command;
    const exchange = await this.exchangeRegistryService.getExchangeByName({
      exchangeName,
    });
    if (!exchange) {
      throw new ExchangeNotFoundException(exchangeName);
    }

    if (!exchange.has['withdraw']) {
      throw new WithdrawalNotSupportedException(exchangeName);
    }

    try {
      const currencies = await exchange.fetchCurrencies();

      if (
        currencies &&
        currencies[symbol] &&
        currencies[symbol].networks &&
        (!network || !currencies[symbol].networks[network])
      ) {
        throw new Error(
          `Network '${network}' is not supported for ${symbol} on ${exchangeName}`,
        );
      }

      return await exchange.withdraw(symbol, amount, address, tag, { network });
    } catch (error) {
      const interpretedError = this.ccxtGateway.interpretError(
        error,
        exchangeName,
      );
      this.logger.error(interpretedError.message);
      throw interpretedError;
    }
  }

  async fetchWithdrawals(
    exchangeName: string,
    network: string,
    symbol: string,
    userId: string,
    txTimestamp?: string,
  ) {
    console.debug(`${txTimestamp} is not used in this method.`);
    const exchange = await this.exchangeRegistryService.getExchangeByName({
      exchangeName,
      userId,
    });
    if (!exchange) {
      throw new ExchangeNotFoundException(exchangeName);
    }

    try {
      return await exchange.fetchWithdrawals();
    } catch (error) {
      const interpretedError = this.ccxtGateway.interpretError(
        error,
        exchangeName,
      );
      this.logger.error(interpretedError.message);
      throw interpretedError;
    }
  }

  async persistInDatabaseUserSuccessfullyWithdrawal(data: any) {
    await this.exchangeWithdrawalRepository.save(data);
  }

  async getPersistedUserSuccessfullyWithdrawalData(data: {
    exchangeName: string;
    symbol: string;
    userId: string;
    txTimestamp?: string;
    network: string;
  }) {
    return await this.exchangeWithdrawalRepository.get(data);
  }
}
