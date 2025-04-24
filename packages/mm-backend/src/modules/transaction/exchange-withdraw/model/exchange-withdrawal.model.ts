import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Decimal } from 'decimal.js';

export class CreateWithdrawalDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  exchangeName: string;

  @AutoMap()
  @ApiProperty()
  @IsString()
  symbol: string;

  @AutoMap()
  @ApiProperty()
  @IsString()
  network: string;

  @AutoMap()
  @ApiProperty()
  @IsString()
  address: string;

  @AutoMap()
  @ApiProperty()
  @IsString()
  tag: string;

  @AutoMap()
  @ApiProperty({ example: '1000.0000000092341234' })
  @IsString()
  amount: string;
}

export class CreateWithdrawalCommand {
  userId: string;
  @AutoMap()
  exchangeName: string;
  @AutoMap()
  symbol: string;
  @AutoMap()
  network: string;
  @AutoMap()
  address: string;
  @AutoMap()
  tag: string;
  @AutoMap()
  amount: Decimal;
}
