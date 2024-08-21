import { Body, Controller, Post, Query } from '@nestjs/common';
import { StrategyExecutorService } from './strategy-executor.service';
import {
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyActionDto,
  ArbitrageStrategyCommand,
  ArbitrageStrategyDto,
} from './strategies/arbitrage/model/arbitrage.dto';
import { ApiTags } from '@nestjs/swagger';
import { StrategyTypeEnums } from '../../common/enums/strategy-type.enums';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyActionDto,
  MarketMakingStrategyCommand,
  MarketMakingStrategyDto,
} from './strategies/market-making/model/market-making.dto';

@ApiTags('strategy')
@Controller('trading-strategy')
export class TradingStrategyController {
  constructor(
    private readonly strategyExecutor: StrategyExecutorService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/execute-arbitrage')
  async executeArbitrage(@Body() dto: ArbitrageStrategyDto) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyDto,
      ArbitrageStrategyCommand,
    );
    return this.strategyExecutor.startArbitrageStrategyForUser(command);
  }

  @Post('/pause-arbitrage')
  async pauseArbitrage(@Query() dto: ArbitrageStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyActionDto,
      ArbitrageStrategyActionCommand,
    );
    command.arbitrage = StrategyTypeEnums.ARBITRAGE;
    return this.strategyExecutor.pauseArbitrageStrategyForUser(command);
  }

  @Post('/stop-arbitrage')
  async stopArbitrage(@Query() dto: ArbitrageStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyActionDto,
      ArbitrageStrategyActionCommand,
    );
    command.arbitrage = StrategyTypeEnums.ARBITRAGE;
    return this.strategyExecutor.stopArbitrageStrategyForUser(command);
  }

  @Post('/execute-market-making')
  async executeMarketMaking(@Body() dto: MarketMakingStrategyDto) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyDto,
      MarketMakingStrategyCommand,
    );
    command.strategyType = StrategyTypeEnums.MARKET_MAKING;
    return this.strategyExecutor.startMarketMakingStrategyForUser(command);
  }

  @Post('/pause-market-making')
  async pauseMarketMaking(@Query() dto: MarketMakingStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyActionDto,
      MarketMakingStrategyActionCommand,
    );
    command.strategyType = StrategyTypeEnums.MARKET_MAKING;
    return this.strategyExecutor.pauseMarketMakingStrategyForUser(command);
  }

  @Post('/stop-market-making')
  async stopMarketMaking(@Query() dto: MarketMakingStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyActionDto,
      MarketMakingStrategyActionCommand,
    );
    command.strategyType = StrategyTypeEnums.MARKET_MAKING;
    return this.strategyExecutor.stopMarketMakingStrategyForUser(command);
  }
}
