import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
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

@ApiTags('web3 identity')
@UsePipes(new ValidationPipe())
@Controller('identity')
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
