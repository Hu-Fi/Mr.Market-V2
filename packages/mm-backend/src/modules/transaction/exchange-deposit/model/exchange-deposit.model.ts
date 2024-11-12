import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ExchangeNetwork } from '../../../../common/enums/exchange.enum';

export class CreateDepositDto {
  @AutoMap()
  @ApiProperty()
  @IsNumber()
  amount: number;

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
  amount: number;

  @AutoMap()
  exchangeName: string;

  @AutoMap()
  symbol: string;

  @AutoMap()
  network: string;
}
