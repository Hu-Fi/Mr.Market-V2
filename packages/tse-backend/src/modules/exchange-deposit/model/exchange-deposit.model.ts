import { AutoMap } from '@automapper/classes';
import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from 'decimal.js';
import { ExchangeNetwork } from '../../../common/enums/exchange-data.enums';

export class CreateDepositDto {
  @AutoMap()
  @ApiProperty({ example: '1000.0000000092341234' })
  @IsString()
  amount: string;

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

export class CreateDepositCommand {
  userId: string;

  @AutoMap()
  amount: Decimal;

  @AutoMap()
  exchangeName: string;

  @AutoMap()
  symbol: string;

  @AutoMap()
  network: string;
}
