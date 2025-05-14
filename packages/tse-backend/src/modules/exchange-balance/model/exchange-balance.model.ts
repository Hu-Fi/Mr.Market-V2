import { AutoMap } from '@automapper/classes';
import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExchangeNetwork } from '../../../common/enums/exchange-data.enums';

export class ExchangeBalanceDto {
  @AutoMap()
  @ApiProperty({ example: 'bybit' })
  @IsString()
  exchangeName: string;

  @AutoMap()
  @ApiProperty({ example: 'ETH' })
  @IsString()
  symbol: string;

  @AutoMap()
  @ApiProperty({ example: 'ERC20', enum: ExchangeNetwork })
  @IsEnum(ExchangeNetwork)
  network: ExchangeNetwork;
}

export class ExchangeBalanceCommand {
  userId: string;

  @AutoMap()
  exchangeName: string;

  @AutoMap()
  symbol: string;

  @AutoMap()
  network: string;
}
