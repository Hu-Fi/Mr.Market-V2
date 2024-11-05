import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExchangeWithdrawalService } from './exchange-withdrawal.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateWithdrawalCommand,
  CreateWithdrawalDto,
} from './model/exchange-withdrawal.model';

@ApiTags('exchange withdrawal')
@UsePipes(new ValidationPipe())
@Controller('exchange-withdrawal')
export class ExchangeWithdrawalController {
  constructor(
    private readonly exchangeWithdrawalService: ExchangeWithdrawalService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Initiate a withdrawal for a specific exchange, symbol, and network',
  })
  async createWithdrawal(@Body() dto: CreateWithdrawalDto) {
    const command = this.mapper.map(
      dto,
      CreateWithdrawalDto,
      CreateWithdrawalCommand,
    );
    return await this.exchangeWithdrawalService.handleWithdrawal(command);
  }
}
