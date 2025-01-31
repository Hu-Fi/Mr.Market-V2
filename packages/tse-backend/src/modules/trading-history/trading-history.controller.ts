import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TradingHistoryService } from './trading-history.service';
import {
  GetUserStrategyHistoryParamsCommand,
  GetUserStrategyHistoryParamsDto,
  GetUserTradingHistoryParamsCommand,
  GetUserTradingHistoryParamsDto,
  GetUserTradingHistoryQueryCommand,
  GetUserTradingHistoryQueryDto,
} from './model/trading-history.model';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@ApiTags('trading history service')
@UsePipes(new ValidationPipe())
@Controller('history')
export class TradingHistoryController {
  constructor(
    private readonly service: TradingHistoryService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Get('/trading/user/:userId')
  @ApiOperation({ summary: 'Retrieve user trading history' })
  async getUserTradingHistory(
    @Param() params: GetUserTradingHistoryParamsDto,
    @Query() query: GetUserTradingHistoryQueryDto,
  ) {
    const paramsCommand = this.mapper.map(
      params,
      GetUserTradingHistoryParamsDto,
      GetUserTradingHistoryParamsCommand,
    );
    const queryCommand = this.mapper.map(
      query,
      GetUserTradingHistoryQueryDto,
      GetUserTradingHistoryQueryCommand,
    );

    return this.service.getUserTradingHistory(paramsCommand, queryCommand);
  }

  @Get('/strategy/user/:userId')
  @ApiOperation({ summary: 'Retrieve user trading strategies' })
  async getUserStrategyHistory(
    @Param() params: GetUserStrategyHistoryParamsDto,
  ) {
    const paramsCommand = this.mapper.map(
      params,
      GetUserStrategyHistoryParamsDto,
      GetUserStrategyHistoryParamsCommand,
    );

    return this.service.getUserStrategyHistory(paramsCommand);
  }
}
