import { Body, Controller, Post, Query } from '@nestjs/common';
import { StrategyExecutorService } from './strategy-executor.service';
import {
  ArbitrageStrategyCommand,
  ArbitrageStrategyDto,
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyActionDto,
} from './strategies/arbitrage/model/arbitrage.dto';
import { ApiTags } from '@nestjs/swagger';
import { StrategyTypeEnums } from '../../common/enums/strategy-type.enums';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

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
}
