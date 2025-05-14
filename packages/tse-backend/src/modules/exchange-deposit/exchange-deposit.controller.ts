import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExchangeDepositService } from './exchange-deposit.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateDepositCommand,
  CreateDepositDto,
} from './model/exchange-deposit.model';
import { RequestWithUser } from '../../common/interfaces/http-request.interfaces';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/utils/auth/guards/roles.guard';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';
import { Role } from '../../common/enums/role.enums';
import { Roles } from '../../common/utils/auth/roles.decorator';

@ApiTags('transaction')
@Controller('transaction')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe())
export class ExchangeDepositController {
  constructor(
    private readonly exchangeDepositService: ExchangeDepositService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Roles(Role.USER)
  @Post('exchange-deposit')
  @ApiOperation({ summary: 'Create address for a deposit' })
  async createDepositAddress(
    @Body() dto: CreateDepositDto,
    @Request() req: RequestWithUser,
  ) {
    const command = this.mapper.map(
      dto,
      CreateDepositDto,
      CreateDepositCommand,
    );
    command.userId = req.user.userId;
    return await this.exchangeDepositService.handleDeposit(command);
  }
}
