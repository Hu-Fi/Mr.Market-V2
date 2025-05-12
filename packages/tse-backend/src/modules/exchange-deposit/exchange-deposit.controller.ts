import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Get,
  Query,
  Request,
} from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateDepositCommand,
  CreateDepositDto,
} from './model/exchange-deposit.model';
import { ApiExcludeController } from '@nestjs/swagger';
import { RequestWithUser } from '../../common/interfaces/http-request.interfaces';

@UsePipes(new ValidationPipe())
@Controller('exchange-deposit')
@ApiExcludeController()
export class ExchangeDepositController {
  constructor(
    private readonly exchangeDepositService: ExchangeDepositService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post()
  async createDepositAddress(@Body() dto: CreateDepositDto, @Request() req: RequestWithUser) {
    const command = this.mapper.map(
      dto,
      CreateDepositDto,
      CreateDepositCommand,
    );
    command.userId = req.user.userId;
    return await this.exchangeDepositService.handleDeposit(command);
  }

  @Get()
  async getDeposits(
    @Query('exchangeName') exchangeName: string,
    @Query('symbol') symbol: string,
    @Request() req: RequestWithUser
  ) {
    return await this.exchangeDepositService.fetchDeposits(
      exchangeName,
      symbol,
      req.user.userId,
    );
  }
}
