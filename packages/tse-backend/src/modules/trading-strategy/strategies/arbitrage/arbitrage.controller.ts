import {
  Body,
  Controller,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ArbitrageStrategy } from './arbitrage.strategy';
import {
  ArbitrageStrategyActionCommand,
  ArbitrageStrategyActionDto,
  ArbitrageStrategyCommand,
  ArbitrageStrategyDto,
} from './model/arbitrage.dto';
import { JwtAuthGuard } from '../../../../common/utils/auth/guards/jwt-auth.guard';

@ApiTags('trading-strategy')
@Controller('trading-strategy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArbitrageController {
  constructor(
    private readonly service: ArbitrageStrategy,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/create-arbitrage')
  async createArbitrage(@Request() req, @Body() dto: ArbitrageStrategyDto) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyDto,
      ArbitrageStrategyCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return this.service.create(command);
  }

  @Put('/pause-arbitrage')
  async pauseArbitrage(
    @Request() req,
    @Query() dto: ArbitrageStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyActionDto,
      ArbitrageStrategyActionCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return this.service.pause(command);
  }

  @Put('/stop-arbitrage')
  async stopArbitrage(
    @Request() req,
    @Query() dto: ArbitrageStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyActionDto,
      ArbitrageStrategyActionCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return this.service.stop(command);
  }

  @Put('/delete-arbitrage')
  async deleteArbitrage(
    @Request() req,
    @Query() dto: ArbitrageStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      ArbitrageStrategyActionDto,
      ArbitrageStrategyActionCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return this.service.delete(command);
  }
}
