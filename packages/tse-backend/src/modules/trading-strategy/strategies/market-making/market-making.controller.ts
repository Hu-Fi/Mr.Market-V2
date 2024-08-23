import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Query } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyActionDto,
  MarketMakingStrategyCommand,
  MarketMakingStrategyDto,
} from './model/market-making.dto';
import { MarketMakingStrategy } from './market-making.strategy';

@ApiTags('trading-strategy')
@Controller('arbitrage')
export class MarketMakingController {
  constructor(
    private readonly service: MarketMakingStrategy,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/create-market-making')
  async createMarketMakingStrategy(@Body() dto: MarketMakingStrategyDto) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyDto,
      MarketMakingStrategyCommand,
    );
    return await this.service.create(command);
  }

  @Post('/pause-market-making')
  async pauseMarketMakingStrategy(@Query() dto: MarketMakingStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyActionDto,
      MarketMakingStrategyActionCommand,
    );
    return await this.service.pause(command);
  }

  @Post('/stop-market-making')
  async stopMarketMakingStrategy(@Query() dto: MarketMakingStrategyActionDto) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyActionDto,
      MarketMakingStrategyActionCommand,
    );
    return await this.service.stop(command);
  }

  @Post('/delete-market-making')
  async deleteMarketMakingStrategy(
    @Query() dto: MarketMakingStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyActionDto,
      MarketMakingStrategyActionCommand,
    );
    return await this.service.delete(command);
  }
}
