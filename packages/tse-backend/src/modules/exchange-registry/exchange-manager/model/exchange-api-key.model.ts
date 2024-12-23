import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsOptional, IsString } from 'class-validator';

export class ExchangeApiKeyDto {
  @AutoMap()
  @ApiPropertyOptional({ example: 'my first account' })
  @IsOptional()
  @IsString()
  description: string;

  @AutoMap()
  @ApiProperty({ example: 'binance' })
  @IsString()
  exchangeName: string;

  @AutoMap()
  @ApiProperty({ example: 'api_key' })
  @IsString()
  apiKey: string;

  @AutoMap()
  @ApiProperty({ example: 'api_secret' })
  @IsString()
  apiSecret: string;

  @AutoMap()
  @ApiPropertyOptional({ example: 'api_passphrase' })
  @IsOptional()
  @IsString()
  apiPassphrase: string;
}

export class ExchangeApiKeyCommand {
  @AutoMap()
  description?: string;

  @AutoMap()
  exchangeName: string;

  @AutoMap()
  apiKey: string;

  @AutoMap()
  apiSecret: string;

  @AutoMap()
  apiPassphrase?: string;
}

export class ExchangeApiKeyData {
  @AutoMap()
  description?: string;

  @AutoMap()
  exchangeName: string;

  @AutoMap()
  apiKey: string;

  @AutoMap()
  apiSecret: string;

  @AutoMap()
  apiPassphrase?: string;

  @AutoMap()
  removed: boolean;
}
