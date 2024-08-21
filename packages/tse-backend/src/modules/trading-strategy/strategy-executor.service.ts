import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ArbitrageStrategyCommand,
  ArbitrageStrategyActionCommand,
} from './strategies/arbitrage/model/arbitrage.dto';
import {
  createStrategyKey,
  isExchangeSupported,
} from '../../common/utils/trading-strategy.utils';
import { StrategyTypeEnums } from '../../common/enums/strategy-type.enums';
import { TradingStrategyService } from './trading-strategy.service';
import { ArbitrageStrategy } from './strategies/arbitrage/arbitrage.strategy';
import { ExchangeRegistryService } from '../exchange-registry/exchange-registry.service';
import { ExchangeTradeService } from '../exchange-trade/exchange-trade.service';

@Injectable()
export class StrategyExecutorService {
  constructor(
    private readonly strategyService: TradingStrategyService,
    private readonly exchangeRegistryService: ExchangeRegistryService,
    private readonly tradeService: ExchangeTradeService,
  ) {}

  async startArbitrageStrategyForUser(command: ArbitrageStrategyCommand) {
    const { exchangeAName, exchangeBName, userId, clientId } = command;

    const isExchangeAValid = isExchangeSupported(
      exchangeAName,
      this.exchangeRegistryService.getSupportedExchanges(),
    );
    const isExchangeBValid = isExchangeSupported(
      exchangeBName,
      this.exchangeRegistryService.getSupportedExchanges(),
    );

    if (!isExchangeAValid || !isExchangeBValid) {
      throw new BadRequestException('Provided exchange is not supported');
    }

    const key = createStrategyKey({
      type: StrategyTypeEnums.ARBITRAGE,
      user_id: userId,
      client_id: clientId,
    });

    const arbitrageStrategyInstance = new ArbitrageStrategy(
      this.exchangeRegistryService,
      this.tradeService,
    );

    await this.strategyService.startStrategy(
      key,
      arbitrageStrategyInstance,
      command,
    );
  }

  async pauseArbitrageStrategyForUser(command: ArbitrageStrategyActionCommand) {
    const key = createStrategyKey({
      type: command.arbitrage,
      user_id: command.userId,
      client_id: command.clientId,
    });

    await this.strategyService.pauseStrategy(key);
  }

  async stopArbitrageStrategyForUser(command: ArbitrageStrategyActionCommand) {
    const key = createStrategyKey({
      type: command.arbitrage,
      user_id: command.userId,
      client_id: command.clientId,
    });

    await this.strategyService.stopStrategy(key);
  }
}
