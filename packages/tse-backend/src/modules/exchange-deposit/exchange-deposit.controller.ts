import { Controller, Post, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExchangeDepositService } from './exchange-deposit.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { CreateDepositCommand, CreateDepositDto } from './model/exchange-deposit.model';

@ApiTags('exchange deposit')
@UsePipes(new ValidationPipe())
@Controller('exchange-deposit')
export class ExchangeDepositController {
  constructor(
    private readonly exchangeDepositService: ExchangeDepositService,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create deposit address for a specific exchange, symbol, and network' })
  async createDepositAddress(@Body() dto: CreateDepositDto) {
    const command = this.mapper.map(dto, CreateDepositDto, CreateDepositCommand);
    return await this.exchangeDepositService.handleDeposit(command);
  }
}
