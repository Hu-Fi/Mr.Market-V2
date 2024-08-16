import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../../common/utils/auth/guards/roles.guard';
import { Roles } from '../../../common/utils/auth/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/utils/auth/guards/jwt-auth.guard';

@Controller('test')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class MockController {
  @Roles(Role.ADMIN)
  @Get('admin')
  adminEndpoint() {
    return 'This is the admin endpoint';
  }

  @Roles(Role.USER)
  @Get('user')
  userEndpoint() {
    return 'This is the user endpoint';
  }
}
