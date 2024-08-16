import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../../common/utils/auth/guards/roles.guard';
import { Roles } from '../../../common/utils/auth/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/utils/auth/guards/jwt-auth.guard';

@Controller('test')
export class MockController {
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  adminEndpoint() {
    return 'This is the admin endpoint';
  }
}
