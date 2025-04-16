import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Web3IdentityService } from './web3-identity.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  IdentityKeyCommand,
  IdentityKeyDto,
  IdentityRpcCommand,
  IdentityRpcDto,
} from './model/web3-identity.model';
import { JwtAuthGuard } from '../../../common/utils/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/utils/auth/guards/roles.guard';
import { Roles } from '../../../common/utils/auth/roles.decorator';
import { Role } from '../../../common/enums/role.enums';

@ApiTags('web3 identity (admin only)')
@UsePipes(new ValidationPipe())
@Controller('identity')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class Web3IdentityController {
  constructor(
    private readonly service: Web3IdentityService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  @Post('/key') async addPrivateKey(@Body() dto: IdentityKeyDto) {
    const command = this.mapper.map(dto, IdentityKeyDto, IdentityKeyCommand);
    await this.service.addIdentityPrivateKey(command);
  }

  @Post('/rpc') async addRpc(@Body() dto: IdentityRpcDto) {
    const command = this.mapper.map(dto, IdentityRpcDto, IdentityRpcCommand);
    await this.service.addIdentityRpc(command);
  }

  @Get('/rpc') async getExchangeApiKeys() {
    return await this.service.getAllRpc();
  }

  @Delete('/rpc') async removeExchangeApiKeys(@Query('id') id: number) {
    await this.service.removeRpc(id);
  }
}
