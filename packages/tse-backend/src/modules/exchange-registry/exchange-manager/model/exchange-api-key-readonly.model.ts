import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

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
}

export class ExchangeApiKeyReadonlyCommand {
  @AutoMap()
  exchangeName: string;

  @AutoMap()
  apiKey: string;

  @AutoMap()
  apiSecret: string;
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
}
