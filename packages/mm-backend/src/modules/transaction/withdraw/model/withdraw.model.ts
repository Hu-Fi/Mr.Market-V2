import { IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @AutoMap()
  @ApiProperty()
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
  amount: string;
  @AutoMap()
  assetId: string;
  @AutoMap()
  destination: string;
}
