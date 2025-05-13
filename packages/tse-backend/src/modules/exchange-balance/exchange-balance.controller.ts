import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExchangeBalanceService } from './exchange-balance.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { RolesGuard } from '../../common/utils/auth/guards/roles.guard';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';
import { Roles } from '../../common/utils/auth/roles.decorator';
import { Role } from '../../common/enums/role.enums';
import { RequestWithUser } from '../../common/interfaces/http-request.interfaces';
import { ExchangeBalanceCommand, ExchangeBalanceDto } from './model/exchange-balance.model';

@ApiTags('transaction')
@Controller('transaction')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExchangeBalanceController {
  constructor(
    private readonly service: ExchangeBalanceService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Roles(Role.USER)
  @Post('exchange/balance')
  @ApiOperation({ summary: 'Request balance for a specific exchange' })
  async getBalance(
    @Body() dto: ExchangeBalanceDto,
    @Request() req: RequestWithUser,
  ) {
    const command = this.mapper.map(
      dto,
      ExchangeBalanceDto,
      ExchangeBalanceCommand,
    );
    command.userId = req.user.userId;
    return await this.service.getExchangeBalance(command);
  }
}
