import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositCommand, DepositDto } from './model/transaction.model';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { DepositResponse } from '../../common/interfaces/transaction.interfaces';
import { Roles } from '../../common/utils/auth/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/utils/auth/guards/roles.guard';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';

@ApiTags('transaction')
@Controller('transaction')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(
    private readonly transactionService: DepositService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Roles(Role.USER)
  @Post('deposit')
  @ApiOperation({ summary: 'Execute a deposit transaction' })
  async deposit(@Body() dto: DepositDto, @Request() req): Promise<DepositResponse> {
    const command = this.mapper.map(dto, DepositDto, DepositCommand);
    command.userId = req.user.userId;
    return this.transactionService.deposit(command);
  }
}
