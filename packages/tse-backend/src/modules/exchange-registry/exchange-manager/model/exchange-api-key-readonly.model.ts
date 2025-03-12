import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsOptional, IsString } from 'class-validator';

export class ExchangeApiKeyReadonlyDto {
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

export class ExchangeApiKeyReadonlyCommand {
  @AutoMap()
  exchangeName: string;

  @AutoMap()
  apiKey: string;

  @AutoMap()
  apiSecret: string;

  @AutoMap()
  apiPassphrase?: string;
}

export class ExchangeApiKeyReadonlyData {
  userId: string;
  clientId: string;

  @AutoMap()
  exchangeName: string;

  @AutoMap()
  apiKey: string;

  @AutoMap()
  apiSecret: string;

  @AutoMap()
  apiPassphrase?: string;
}
