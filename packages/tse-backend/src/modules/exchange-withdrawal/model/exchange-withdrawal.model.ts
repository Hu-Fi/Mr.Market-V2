import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from 'decimal.js';

export class CreateWithdrawalDto {
  @AutoMap()
  @IsString()
  userId: string;

  @AutoMap()
  @IsString()
  exchangeName: string;

  @AutoMap()
  @IsString()
  symbol: string;

  @AutoMap()
  @IsString()
  network: string;

  @AutoMap()
  @IsString()
  address: string;

  @AutoMap()
  @IsString()
  tag: string;

  @AutoMap()
  @ApiProperty({ example: '1000.0000000092341234' })
  @IsString()
  amount: string;
}

export class CreateWithdrawalCommand {
  @AutoMap()
  @IsString()
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
