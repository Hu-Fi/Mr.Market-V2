import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

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
  @ApiProperty()
  @IsNumber()
  amount: number;
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
  amount: number;
}
