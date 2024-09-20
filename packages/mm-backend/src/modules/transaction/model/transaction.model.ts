import { IsNumber, IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  userId: string;

  @AutoMap()
  @ApiProperty()
  @IsNumber()
  amount: number;

  @AutoMap()
  @ApiProperty()
  @IsString()
  currency: string;

  @AutoMap()
  @ApiProperty()
  @IsString()
  exchange: string;
}

export class WithdrawDto {
  @AutoMap()
  @ApiProperty()
  @IsString()
  userId: string;

  @AutoMap()
  @ApiProperty()
  @IsNumber()
  amount: number;

  @AutoMap()
  @ApiProperty()
  @IsString()
  currency: string;

  @AutoMap()
  @ApiProperty()
  @IsString()
  exchange: string;
}

export class DepositCommand {
  @AutoMap()
  userId: string;
  @AutoMap()
  amount: number;
  @AutoMap()
  currency: string;
  @AutoMap()
  exchange: string;
}

export class WithdrawCommand {
  @AutoMap()
  userId: string;
  @AutoMap()
  amount: number;
  @AutoMap()
  currency: string;
  @AutoMap()
  exchange: string;
}
