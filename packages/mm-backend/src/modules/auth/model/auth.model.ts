import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

export class AdminLoginDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  password: string;
}

export class AdminLoginCommand {
  @AutoMap()
  password: string;
}

export class MixinOAuthDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  code: string;
}

export class MixinOAuthCommand {
  @AutoMap()
  code: string;
}

export interface AdminLoginResponse {
  accessToken: string;
}

export interface MixinOAuthResponse {
  ed25519: string;
  authorization_id: string;
  scope: string;
}
