import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Query,
} from '@nestjs/common';
import { ExchangeWithdrawalService } from './exchange-withdrawal.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateWithdrawalCommand,
  CreateWithdrawalDto,
} from './model/exchange-withdrawal.model';
import { ApiExcludeController } from '@nestjs/swagger';

@UsePipes(new ValidationPipe())
@Controller('exchange-withdrawal')
@ApiExcludeController()
export class ExchangeWithdrawalController {
  constructor(
    private readonly exchangeWithdrawalService: ExchangeWithdrawalService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post()
  async createWithdrawal(@Body() dto: CreateWithdrawalDto) {
    const command = this.mapper.map(
      dto,
      CreateWithdrawalDto,
      CreateWithdrawalCommand,
    );
    return await this.exchangeWithdrawalService.handleWithdrawal(command);
  }

  @Get()
  async getWithdrawal(
    @Query('exchangeName') exchangeName: string,
    @Query('transactionHash') transactionHash: string,
    @Query('userId') userId: string,
  ) {
    return await this.exchangeWithdrawalService.fetchWithdrawal(
      exchangeName,
      transactionHash,
      userId,
    );
  }
}
//TODO: handle jwt user
