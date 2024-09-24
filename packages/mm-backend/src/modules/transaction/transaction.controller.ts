import { Body, Controller, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { DepositCommand, DepositDto, WithdrawCommand, WithdrawDto } from './model/transaction.model';
import { UserBalance } from '../../common/entities/user-balance.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { DepositResponse } from '../../common/interfaces/transaction.interfaces';

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Execute a deposit transaction' })
  async deposit(@Body() dto: DepositDto): Promise<DepositResponse> {
    const command = this.mapper.map(dto, DepositDto, DepositCommand);
    return this.transactionService.deposit(command);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Execute a withdrawal transaction' })
  async withdraw(@Body() dto: WithdrawDto) {
    const command = this.mapper.map(dto, WithdrawDto, WithdrawCommand);
    return this.transactionService.withdraw(command);
  }
}
