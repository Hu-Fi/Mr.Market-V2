import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { MixinDepositService } from './mixin-deposit/mixin-deposit.service';
import {
  DepositCommand,
  DepositDto,
} from './mixin-deposit/model/mixin-deposit.model';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { MixinDepositResponse } from '../../common/interfaces/transaction.interfaces';
import { Roles } from '../../common/utils/auth/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/utils/auth/guards/roles.guard';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';
import { MixinWithdrawalService } from './mixin-withdraw/mixin-withdrawal.service';
import {
  WithdrawCommand,
  WithdrawDto,
} from './mixin-withdraw/model/mixin-withdrawal.model';
import { ExchangeDepositService } from './exchange-deposit/exchange-deposit.service';
import { ExchangeWithdrawalService } from './exchange-withdraw/exchange-withdrawal.service';
import {
  CreateDepositCommand,
  CreateDepositDto,
} from './exchange-deposit/model/exchange-deposit.model';
import {
  CreateWithdrawalCommand,
  CreateWithdrawalDto,
} from './exchange-withdraw/model/exchange-withdrawal.model';

@ApiTags('transaction')
@Controller('transaction')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(
    private readonly mixinDepositService: MixinDepositService,
    private readonly mixinWithdrawService: MixinWithdrawalService,
    private readonly exchangeDepositService: ExchangeDepositService,
    private readonly exchangeWithdrawService: ExchangeWithdrawalService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Roles(Role.USER)
  @Post('mixin-deposit')
  @ApiOperation({ summary: 'Create address for a deposit' })
  async mixinDeposit(
    @Body() dto: DepositDto,
    @Request() req,
  ): Promise<MixinDepositResponse> {
    const command = this.mapper.map(dto, DepositDto, DepositCommand);
    command.userId = req.user.userId;
    return this.mixinDepositService.deposit(command);
  }

  @Roles(Role.USER)
  @Post('mixin-withdraw')
  @ApiOperation({ summary: 'Execute a withdraw transaction' })
  async mixinWithdraw(@Body() dto: WithdrawDto, @Request() req): Promise<any> {
    const command = this.mapper.map(dto, WithdrawDto, WithdrawCommand);
    command.userId = req.user.userId;
    return this.mixinWithdrawService.withdraw(command);
  }

  @Roles(Role.USER)
  @Post('exchange-deposit')
  @ApiOperation({ summary: 'Create address for a deposit' })
  async exchangeDeposit(@Body() dto: CreateDepositDto, @Request() req) {
    const command = this.mapper.map(
      dto,
      CreateDepositDto,
      CreateDepositCommand,
    );
    command.userId = req.user.userId;
    return this.exchangeDepositService.deposit(command);
  }

  @Roles(Role.USER)
  @Post('exchange-withdraw')
  @ApiOperation({ summary: 'Execute a withdraw transaction' })
  async exchangeWithdraw(@Body() dto: CreateWithdrawalDto, @Request() req) {
    const command = this.mapper.map(
      dto,
      CreateWithdrawalDto,
      CreateWithdrawalCommand,
    );
    command.userId = req.user.userId;
    return this.exchangeWithdrawService.withdraw(command);
  }
}
