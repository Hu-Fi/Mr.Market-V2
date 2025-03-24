import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/utils/auth/guards/roles.guard';
import { JwtAuthGuard } from '../../common/utils/auth/guards/jwt-auth.guard';
import { Roles } from '../../common/utils/auth/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { UserBalanceResponse } from '../../common/interfaces/mixin.interfaces';
import { UserBalanceService } from './user-balance.service';

@ApiTags('user')
@Controller('user')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserBalanceController {
  constructor(private readonly service: UserBalanceService) {}

  @Roles(Role.USER)
  @Get('mixin/balance')
  async getBalance(@Request() req): Promise<UserBalanceResponse> {
    const clientId = req.user.clientId;
    return await this.service.getMixinUserBalance(clientId);
  }
}
