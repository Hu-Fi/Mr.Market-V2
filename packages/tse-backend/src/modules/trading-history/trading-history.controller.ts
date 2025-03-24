import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TradingHistoryService } from './trading-history.service';
import {
  GetUserTradingHistoryQueryCommand,
  GetUserTradingHistoryQueryDto,
} from './model/trading-history.model';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';

@ApiTags('trading history service')
@UsePipes(new ValidationPipe())
@Controller('history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TradingHistoryController {
  constructor(
    private readonly service: TradingHistoryService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Get('/trading/user')
  @ApiOperation({ summary: 'Retrieve user trading history' })
  async getUserTradingHistory(
    @Query() query: GetUserTradingHistoryQueryDto,
    @Request() req,
  ) {
    const queryCommand = this.mapper.map(
      query,
      GetUserTradingHistoryQueryDto,
      GetUserTradingHistoryQueryCommand,
    );
    return this.service.getUserTradingHistory(req.user.userId, queryCommand);
  }

  @Get('/strategy/user')
  @ApiOperation({ summary: 'Retrieve user trading strategies' })
  async getUserStrategyHistory(@Request() req) {
    return this.service.getUserStrategyHistory(req.user.userId);
  }
}
