import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateDepositCommand,
  CreateDepositDto,
} from './model/exchange-deposit.model';
import { ApiExcludeController } from '@nestjs/swagger';

@UsePipes(new ValidationPipe())
@Controller('exchange-deposit')
@ApiExcludeController()
export class ExchangeDepositController {
  constructor(
    private readonly exchangeDepositService: ExchangeDepositService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post()
  async createDepositAddress(@Body() dto: CreateDepositDto) {
    const command = this.mapper.map(
      dto,
      CreateDepositDto,
      CreateDepositCommand,
    );
    return await this.exchangeDepositService.handleDeposit(command);
  }

  @Get()
  async getDeposits(
    @Query('exchangeName') exchangeName: string,
    @Query('symbol') symbol: string,
    @Query('userId') userId: string,
  ) {
    return await this.exchangeDepositService.fetchDeposits(
      exchangeName,
      symbol,
      userId,
    );
  }
}
// TODO: handle jwt user
