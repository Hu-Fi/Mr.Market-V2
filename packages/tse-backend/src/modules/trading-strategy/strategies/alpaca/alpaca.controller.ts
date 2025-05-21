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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { AlpacaStrategy } from './alpaca.strategy';
import {
  AlpacaStrategyActionCommand,
  AlpacaStrategyActionDto,
  AlpacaStrategyCommand,
  AlpacaStrategyDto,
} from './model/alpaca.model';
import { JwtAuthGuard } from '../../../../common/utils/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../../../common/interfaces/http-request.interfaces';

@UsePipes(new ValidationPipe())
@ApiTags('trading-strategy')
@Controller('trading-strategy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlpacaController {
  constructor(
    private readonly service: AlpacaStrategy,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/create-alpaca')
  async createAlpaca(
    @Request() req: RequestWithUser,
    @Body() dto: AlpacaStrategyDto,
  ) {
    const command = this.mapper.map(
      dto,
      AlpacaStrategyDto,
      AlpacaStrategyCommand,
    );
    command.userId = req.user.userId;
    command.clientId = req.user.clientId;
    return this.service.create(command);
  }

  @Put('/pause-alpaca')
  async pauseAlpaca(
    @Request() req: RequestWithUser,
    @Query() dto: AlpacaStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      AlpacaStrategyActionDto,
      AlpacaStrategyActionCommand,
    );
    command.userId = req.user.userId;
    command.clientId = req.user.clientId;
    return this.service.pause(command);
  }

  @Put('/stop-alpaca')
  async stopAlpaca(
    @Request() req: RequestWithUser,
    @Query() dto: AlpacaStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      AlpacaStrategyActionDto,
      AlpacaStrategyActionCommand,
    );
    command.userId = req.user.userId;
    command.clientId = req.user.clientId;
    return this.service.stop(command);
  }

  @Put('/delete-alpaca')
  async deleteAlpaca(
    @Request() req: RequestWithUser,
    @Query() dto: AlpacaStrategyActionDto,
  ) {
    const command = this.mapper.map(
      dto,
      AlpacaStrategyActionDto,
      AlpacaStrategyActionCommand,
    );
    command.userId = req.user.userId;
    command.clientId = req.user.clientId;
    return this.service.delete(command);
  }
}
