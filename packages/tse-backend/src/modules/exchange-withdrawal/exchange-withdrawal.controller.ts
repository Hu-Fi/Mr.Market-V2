import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExchangeWithdrawalService } from './exchange-withdrawal.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  CreateWithdrawalCommand,
  CreateWithdrawalDto,
} from './model/exchange-withdrawal.model';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/utils/auth/guards/roles.guard';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';
import { Roles } from '../../common/utils/auth/roles.decorator';
import { Role } from '../../common/enums/role.enums';
import { RequestWithUser } from '../../common/interfaces/http-request.interfaces';

@ApiTags('transaction')
@Controller('transaction')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe())
export class ExchangeWithdrawalController {
  constructor(
    private readonly exchangeWithdrawalService: ExchangeWithdrawalService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Roles(Role.USER)
  @Post('exchange-withdraw')
  @ApiOperation({ summary: 'Execute a withdraw transaction' })
  async createWithdrawal(
    @Body() dto: CreateWithdrawalDto,
    @Request() req: RequestWithUser,
  ) {
    const command = this.mapper.map(
      dto,
      CreateWithdrawalDto,
      CreateWithdrawalCommand,
    );
    command.userId = req.user.userId;
    return await this.exchangeWithdrawalService.handleWithdrawal(command);
  }
}
