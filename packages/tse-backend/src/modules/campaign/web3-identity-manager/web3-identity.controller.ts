import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Web3IdentityService } from './web3-identity.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { IdentityKeyCommand, IdentityKeyDto, IdentityRpcCommand, IdentityRpcDto } from './model/web3-identity.model';

@ApiTags('web3 identity')
@UsePipes(new ValidationPipe())
@Controller('identity')
export class Web3IdentityController {
  constructor(
    private readonly service: Web3IdentityService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {
  }

  @Post('/key') async addPrivateKey(@Body() dto: IdentityKeyDto) {
    const command = this.mapper.map(dto, IdentityKeyDto, IdentityKeyCommand);
    return await this.service.addIdentityPrivateKey(command);
  }

  @Post('/rpc') async addRpc(@Body() dto: IdentityRpcDto) {
    const command = this.mapper.map(dto, IdentityRpcDto, IdentityRpcCommand);
    return await this.service.addIdentityRpc(command);
  }
}
