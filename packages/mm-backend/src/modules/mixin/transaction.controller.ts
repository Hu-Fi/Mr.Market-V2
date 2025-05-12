import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { MixinDepositService } from './deposit/mixin-deposit.service';
import {
  DepositCommand,
  DepositDto,
} from './deposit/model/mixin-deposit.model';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { MixinDepositResponse } from '../../common/interfaces/transaction.interfaces';
import { Roles } from '../../common/utils/auth/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/utils/auth/guards/roles.guard';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';
import { MixinWithdrawalService } from './withdrawal/mixin-withdrawal.service';
import {
  WithdrawCommand,
  WithdrawDto,
} from './withdrawal/model/mixin-withdrawal.model';
import { RequestWithUser } from '../../common/interfaces/http-request.interfaces';

@ApiTags('transaction')
@Controller('transaction')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(
    private readonly mixinDepositService: MixinDepositService,
    private readonly mixinWithdrawService: MixinWithdrawalService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Roles(Role.USER)
  @Post('mixin-deposit')
  @ApiOperation({ summary: 'Create address for a deposit' })
  async mixinDeposit(
    @Body() dto: DepositDto,
    @Request() req: RequestWithUser,
  ): Promise<MixinDepositResponse> {
    if (req.user.clientId === Role.ADMIN) {
      throw new ForbiddenException(
        'This endpoint is intended for Mixin App users only',
      );
    }

    const command = this.mapper.map(dto, DepositDto, DepositCommand);
    command.userId = req.user.userId;
    return this.mixinDepositService.deposit(command);
  }

  @Roles(Role.USER)
  @Post('mixin-withdraw')
  @ApiOperation({ summary: 'Execute a withdraw transaction' })
  async mixinWithdraw(
    @Body() dto: WithdrawDto,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.clientId === Role.ADMIN) {
      throw new ForbiddenException(
        'This endpoint is intended for Mixin App users only',
      );
    }

    const command = this.mapper.map(dto, WithdrawDto, WithdrawCommand);
    command.userId = req.user.userId;
    return this.mixinWithdrawService.withdraw(command);
  }
}
