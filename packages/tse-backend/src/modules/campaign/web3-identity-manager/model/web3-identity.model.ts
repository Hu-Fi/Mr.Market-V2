import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class IdentityKeyDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  privateKey: string;
}

export class IdentityKeyCommand {
  @AutoMap()
  privateKey: string;
}

export class IdentityKeyData {
  @AutoMap()
  privateKey: string;
}

export class IdentityRpcDto {
  @AutoMap()
  @ApiProperty()
  @IsNumber()
  chainId: number;

  @AutoMap()
  @ApiProperty()
  @IsString()
  rpcUrl: string;
}

export class IdentityRpcCommand {
  @AutoMap()
  chainId: number;

  @AutoMap()
  rpcUrl: string;
}

export class IdentityRpcData {
  @AutoMap()
  chainId: number;

  @AutoMap()
  rpcUrl: string;
}
