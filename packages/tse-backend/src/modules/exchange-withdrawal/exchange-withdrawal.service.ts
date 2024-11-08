import { Injectable, Logger } from '@nestjs/common';
import { CcxtGateway } from '../../integrations/ccxt.gateway';
import {
  ExchangeNotFoundException,
  WithdrawalNotSupportedException,
} from '../../common/filters/withdrawal.exception.filter';
import { CreateWithdrawalCommand } from './model/exchange-withdrawal.model';

@Injectable()
export class ExchangeWithdrawalService {
  private readonly logger = new Logger(ExchangeWithdrawalService.name);

  constructor(private readonly ccxtGateway: CcxtGateway) {}

  async handleWithdrawal(command: CreateWithdrawalCommand) {
    const { exchangeName, symbol, network, address, tag, amount } = command;
    const exchange = this.ccxtGateway.getExchange(exchangeName);
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

  async fetchWithdrawal(exchangeName: string, transactionHash: string) {
    const exchange = this.ccxtGateway.getExchange(exchangeName);
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
