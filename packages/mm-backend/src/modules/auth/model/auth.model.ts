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

export class RefreshTokenDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokenCommand {
  @AutoMap()
  refreshToken: string;
}

export class LogoutDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class LogoutCommand {
  @AutoMap()
  refreshToken: string;
}
