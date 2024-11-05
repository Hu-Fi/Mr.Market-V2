import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDepositDto {
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
}

export class CreateDepositCommand {
  @AutoMap()
  exchangeName: string;

  @AutoMap()
  symbol: string;

  @AutoMap()
  network: string;
}
