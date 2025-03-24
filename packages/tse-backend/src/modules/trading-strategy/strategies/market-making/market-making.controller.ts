import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  MarketMakingStrategyActionCommand,
  MarketMakingStrategyActionDto,
  MarketMakingStrategyCommand,
  MarketMakingStrategyDto,
} from './model/market-making.dto';
import { MarketMakingStrategy } from './market-making.strategy';
import { JwtAuthGuard } from '../../../../common/utils/auth/guards/jwt-auth.guard';

@UsePipes(new ValidationPipe())
@ApiTags('trading-strategy')
@Controller('trading-strategy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketMakingController {
  constructor(
    private readonly service: MarketMakingStrategy,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/create-market-making')
  async createMarketMakingStrategy(
    @Request() req,
    @Body() dto: MarketMakingStrategyDto,
  ) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyDto,
      MarketMakingStrategyCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return await this.service.create(command);
  }

  @Put('/pause-market-making')
  async pauseMarketMakingStrategy(
    @Request() req,
    @Query() dto: MarketMakingStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyActionDto,
      MarketMakingStrategyActionCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return await this.service.pause(command);
  }

  @Put('/stop-market-making')
  async stopMarketMakingStrategy(
    @Request() req,
    @Query() dto: MarketMakingStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyActionDto,
      MarketMakingStrategyActionCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return await this.service.stop(command);
  }

  @Put('/delete-market-making')
  async deleteMarketMakingStrategy(
    @Request() req,
    @Query() dto: MarketMakingStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      MarketMakingStrategyActionDto,
      MarketMakingStrategyActionCommand,
    );
    command.userId = req.user.id;
    command.clientId = req.user.clientId;
    return await this.service.delete(command);
  }
}
