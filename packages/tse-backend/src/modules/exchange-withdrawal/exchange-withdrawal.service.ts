import { Injectable, Logger } from '@nestjs/common';
import { CcxtIntegrationService } from '../../integrations/ccxt.integration.service';
import {
  ExchangeNotFoundException,
  WithdrawalNotSupportedException,
} from '../../common/filters/withdrawal.exception.filter';
import { CreateWithdrawalCommand } from './model/exchange-withdrawal.model';
import { ExchangeRegistryService } from '../exchange-registry/exchange-registry.service';

@Injectable()
export class ExchangeWithdrawalService {
  private readonly logger = new Logger(ExchangeWithdrawalService.name);

  constructor(
    private readonly ccxtGateway: CcxtIntegrationService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
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

  async fetchWithdrawal(
    exchangeName: string,
    transactionHash: string,
    userId: string,
  ) {
    const exchange = await this.exchangeRegistryService.getExchangeByName({
      exchangeName,
      userId,
    });
    if (!exchange) {
      throw new ExchangeNotFoundException(exchangeName);
    }

    try {
      return await exchange.fetchWithdrawals(transactionHash);
    } catch (error) {
      const interpretedError = this.ccxtGateway.interpretError(
        error,
        exchangeName,
      );
      this.logger.error(interpretedError.message);
      throw interpretedError;
    }
  }
}
