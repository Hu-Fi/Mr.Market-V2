import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ArbitrageStrategy } from './arbitrage.strategy';
import {
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyActionDto,
  ArbitrageStrategyCommand,
  ArbitrageStrategyDto,
} from './model/arbitrage.dto';

@ApiTags('trading-strategy')
@Controller('arbitrage')
export class ArbitrageController {
  constructor(
    private readonly service: ArbitrageStrategy,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/create-arbitrage')
  async createArbitrage(@Body() dto: ArbitrageStrategyDto) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyDto,
      ArbitrageStrategyCommand,
    );
    return this.service.create(command);
  }

  @Post('/pause-arbitrage')
  async pauseArbitrage(@Query() dto: ArbitrageStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyActionDto,
      ArbitrageStrategyActionCommand,
    );
    return this.service.pause(command);
  }

  @Post('/stop-arbitrage')
  async stopArbitrage(@Query() dto: ArbitrageStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyActionDto,
      ArbitrageStrategyActionCommand,
    );
    return this.service.stop(command);
  }

  @Post('/delete-arbitrage')
  async deleteArbitrage(@Query() dto: ArbitrageStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyActionDto,
      ArbitrageStrategyActionCommand,
    );
    return this.service.delete(command);
  }
}
