import { IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from 'decimal.js';

export class WithdrawDto {
  @AutoMap()
  @ApiProperty({ example: '1000.0000000092341234' })
  @IsString()
  amount: string;

  @AutoMap()
  @ApiProperty({ example: '43d61dcd-e413-450d-80b8-101d5e903357' })
  @IsString()
  assetId: string;

  @AutoMap()
  @ApiProperty()
  @IsString()
  destination: string;
}

export class WithdrawCommand {
  userId: string;
  @AutoMap()
  amount: Decimal;
  @AutoMap()
  assetId: string;
  @AutoMap()
  destination: string;
}
