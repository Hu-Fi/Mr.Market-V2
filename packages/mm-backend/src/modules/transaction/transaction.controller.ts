import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { DepositService } from './deposit/deposit.service';
import { DepositCommand, DepositDto } from './deposit/model/deposit.model';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { DepositResponse } from '../../common/interfaces/transaction.interfaces';
import { Roles } from '../../common/utils/auth/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/utils/auth/guards/roles.guard';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';
import { WithdrawService } from './withdraw/withdraw.service';
import { WithdrawCommand, WithdrawDto } from './withdraw/model/withdraw.model';

@ApiTags('transaction')
@Controller('transaction')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(
    private readonly depositService: DepositService,
    private readonly withdrawService: WithdrawService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Roles(Role.USER)
  @Post('deposit')
  @ApiOperation({ summary: 'Create address for a deposit' })
  async deposit(
    @Body() dto: DepositDto,
    @Request() req,
  ): Promise<DepositResponse> {
    const command = this.mapper.map(dto, DepositDto, DepositCommand);
    command.userId = req.user.userId;
    return this.depositService.deposit(command);
  }

  @Roles(Role.USER)
  @Post('withdraw')
  @ApiOperation({ summary: 'Execute a withdraw transaction' })
  async withdraw(@Body() dto: WithdrawDto, @Request() req): Promise<any> {
    const command = this.mapper.map(dto, WithdrawDto, WithdrawCommand);
    command.userId = req.user.userId;
    return this.withdrawService.withdraw(command);
  }
}
